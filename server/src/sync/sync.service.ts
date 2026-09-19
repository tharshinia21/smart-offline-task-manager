import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Task } from '../schemas/task.schema'

/**
 * Sync semantics (MongoDB):
 * - Client sends batch of changes with { id, operation, payload, version, timestamp }
 * - Server applies with conflict detection via version numbers
 * - Pull returns all tasks updated since `since` timestamp
 */
@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name)
  private notifSvc:any=null
  setNotificationsService(s:any){ this.notifSvc=s }
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async push(userId: string, changes: any[]) {
    const results: any[] = []
    for (const c of changes) {
      try {
        if (c.operation === 'create') {
          const existing = c.payload?.id ? await this.taskModel.findOne({ clientId: c.payload.id, userId }) : null
          if (existing) { results.push({ taskId: c.taskId, status: 'already_exists', server: existing }); continue }
          const p = c.payload
           const doc = await this.taskModel.create({
            userId,
            title: p.title,
            dueDate: p.dueDate,
            dueTime: p.dueTime,
            link: p.link,
            linkName: p.linkName,
            status: p.status || 'not_started',
            version: p.version || 1,
            clientId: p.id,
            completedAt: p.completedAt,
            deletedAt: p.deletedAt,
            snoozedUntil: p.snoozedUntil,
          })
           if (this.notifSvc) this.notifSvc.scheduleForTask(doc).catch(()=>{})
           results.push({ taskId: c.taskId, status: 'created', server: doc })
        } else if (c.operation === 'update') {
          let server: any = null
          // try _id then clientId
          server = await this.taskModel.findOne({ _id: c.taskId, userId })
          if (!server) server = await this.taskModel.findOne({ clientId: c.taskId, userId })
          if (!server) { results.push({ taskId: c.taskId, status: 'not_found' }); continue }
          if (c.version !== undefined && c.version <= server.version && c.version !== server.version + 1) {
            // conflict: keep server version, report
            results.push({ taskId: c.taskId, status: 'conflict', server, clientVersion: c.version })
            continue
          }
           Object.assign(server, { ...c.payload, version: server.version + 1 })
           // don't overwrite userId/_id
           server.userId = userId
           await server.save()
           if (this.notifSvc) this.notifSvc.scheduleForTask(server).catch(()=>{})
           results.push({ taskId: c.taskId, status: 'updated', server })
        } else if (c.operation === 'delete') {
          let server: any = await this.taskModel.findOne({ _id: c.taskId, userId })
          if (!server) server = await this.taskModel.findOne({ clientId: c.taskId, userId })
          if (!server) { results.push({ taskId: c.taskId, status: 'not_found' }); continue }
           server.deletedAt = Date.now()
           server.version += 1
           await server.save()
           if (this.notifSvc) this.notifSvc.cancelForTask(server._id.toString()).catch(()=>{})
           results.push({ taskId: c.taskId, status: 'deleted', server })
        }
      } catch (e: any) {
        results.push({ taskId: c.taskId, status: 'error', error: e.message })
      }
    }
    return { results }
  }

  async pull(userId: string, since?: number) {
    const filter: any = { userId }
    if (since) filter.updatedAt = { $gt: new Date(since) }
    const tasks = await this.taskModel.find(filter).sort({ updatedAt: 1 }).lean()
    return { tasks, serverTime: Date.now() }
  }
}
