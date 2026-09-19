import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Task } from '../schemas/task.schema'
import { z } from 'zod'

const createSchema = z.object({
  id: z.string().optional(), // client id (IndexedDB)
  title: z.string().min(1).max(200),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueTime: z.string().regex(/^\d{2}:\d{2}$/),
  link: z.string().url().optional().or(z.literal('')),
  linkName: z.string().optional(),
  status: z.enum(['not_started','in_progress','completed','cancelled']).optional(),
  version: z.number().optional(),
})

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name)
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}
  private notifSvc: any = null
  setNotificationsService(svc:any){ this.notifSvc = svc }

  async list(userId: string) {
    return this.taskModel.find({ userId, deletedAt: { $exists: false } as any }).sort({ updatedAt: -1 }).lean()
  }

  async get(userId: string, id: string) {
    const t = await this.taskModel.findOne({ _id: id, userId })
    if (!t) throw new NotFoundException('Task not found')
    return t
  }

  async create(userId: string, dto: any) {
    const data = createSchema.parse(dto)
    const doc = await this.taskModel.create({
      userId,
      title: data.title,
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      link: data.link || undefined,
      linkName: data.linkName,
      status: data.status || 'not_started',
      version: 1,
      clientId: data.id,
    })
    if (this.notifSvc) this.notifSvc.scheduleForTask(doc).catch((e:any)=>this.logger.warn(e.message))
    return doc
  }

  async update(userId: string, id: string, dto: any) {
    const data = createSchema.partial().parse(dto)
    const existing: any = await this.taskModel.findOne({ _id: id, userId })
    if (!existing) throw new NotFoundException('Task not found')
    // simple optimistic concurrency: if dto.version < existing.version -> conflict
    if (data.version !== undefined && data.version < existing.version) {
      throw new ForbiddenException({ message: 'Version conflict', serverVersion: existing.version, serverTask: existing })
    }
    Object.assign(existing, { ...data, version: existing.version + 1 })
    await existing.save()
    if (this.notifSvc) this.notifSvc.scheduleForTask(existing).catch((e:any)=>this.logger.warn(e.message))
    return existing
  }

  async remove(userId: string, id: string) {
    const t: any = await this.taskModel.findOne({ _id: id, userId })
    if (!t) throw new NotFoundException('Task not found')
    t.deletedAt = Date.now()
    t.version += 1
    await t.save()
    if (this.notifSvc) this.notifSvc.cancelForTask(t._id.toString()).catch(()=>{})
    return { deleted: true }
  }

  // actions
  async complete(userId: string, id: string) {
    return this.update(userId, id, { status: 'completed', completedAt: Date.now() } as any)
  }
  async start(userId: string, id: string) {
    return this.update(userId, id, { status: 'in_progress' })
  }
  async snooze(userId: string, id: string, mins: number) {
    const t: any = await this.get(userId, id)
    t.snoozedUntil = Date.now() + mins * 60000
    t.version += 1
    await t.save()
    if (this.notifSvc) this.notifSvc.scheduleForTask(t).catch(()=>{})
    return t
  }
  async reschedule(userId: string, id: string, dueDate: string, dueTime: string) {
    return this.update(userId, id, { dueDate, dueTime })
  }
}
