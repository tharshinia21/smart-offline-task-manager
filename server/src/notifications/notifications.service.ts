import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Device } from '../schemas/device.schema'
import { Task } from '../schemas/task.schema'
import * as webPush from 'web-push'
import { Queue, Worker, QueueEvents } from 'bullmq'
import IORedis from 'ioredis'

function parseDeadline(task: any): Date {
  return new Date(`${task.dueDate}T${task.dueTime}:00`)
}
function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()
}
function getPriority(task: any, now = new Date()): string {
  const deadline = parseDeadline(task)
  const remaining = deadline.getTime() - now.getTime()
  if (remaining < 0) return 'overdue'
  if (isSameDay(deadline, now)) return 'critical'
  const days = Math.ceil(remaining / (1000*60*60*24))
  if (days >= 15) return 'low'
  if (days >= 7) return 'medium'
  if (days >= 3) return 'high'
  if (days >= 1) return 'very_high'
  return 'critical'
}
function getFrequency(p: string): string {
  switch(p){
    case 'low': return 'none'
    case 'medium': return 'daily'
    case 'high': return 'daily'
    case 'very_high': return '4h'
    case 'critical': return '4h'
    case 'overdue': return 'overdue'
    default: return 'none'
  }
}
function isQuietHours(now = new Date()): boolean {
  const h = now.getHours()
  return h >= 23 || h < 7
}
function nextAllowedTime(now = new Date()): Date {
  const n = new Date(now)
  if (!isQuietHours(n)) return n
  n.setHours(7,0,0,0)
  if (n.getTime() <= now.getTime()) n.setDate(n.getDate()+1)
  n.setHours(7,0,0,0)
  return n
}
function nextScheduledTime(task: any, now = new Date()): Date | null {
  const p = getPriority(task, now)
  const freq = getFrequency(p)
  if (freq === 'none') return null
  // if snoozed, delay at least until snoozedUntil
  let base = new Date(now)
  if (task.snoozedUntil && task.snoozedUntil > now.getTime()) {
    base = new Date(task.snoozedUntil)
  }
  // respect quiet hours from base
  if (isQuietHours(base)) base = nextAllowedTime(base)

  if (freq === 'daily' || freq === 'overdue') {
    // next 09:00
    const cand = new Date(base)
    cand.setHours(9,0,0,0)
    if (cand.getTime() <= base.getTime()) cand.setDate(cand.getDate()+1)
    // if cand is in quiet? 09 not quiet, but if base was quiet adjusted to 07, cand 09 same day is > base
    if (isQuietHours(cand)) return nextAllowedTime(cand)
    return cand
  }
  if (freq === '4h') {
    const slots = [7,11,15,19]
    const cand = new Date(base)
    // find next slot strictly after base
    for (let dayOffset=0; dayOffset<2; dayOffset++) {
      for (const h of slots) {
        const c = new Date(base)
        c.setDate(base.getDate()+dayOffset)
        c.setHours(h,0,0,0)
        if (c.getTime() > base.getTime()) {
          if (isQuietHours(c)) continue
          return c
        }
      }
    }
    // fallback 4h later
    const fallback = new Date(base.getTime()+4*60*60*1000)
    return isQuietHours(fallback) ? nextAllowedTime(fallback) : fallback
  }
  return null
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)
  private queue: Queue | null = null
  private worker: Worker | null = null
  private connection: IORedis | null = null
  private enabled = false

  constructor(
    @InjectModel(Device.name) private deviceModel: Model<Device>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
  ) {
    const redisUrl = process.env.REDIS_URL || (process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT||6379}` : null)
    const vapidPublic = process.env.VAPID_PUBLIC_KEY
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@smarttasks.local'
    if (vapidPublic && vapidPrivate) {
      try { webPush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate) } catch(e){ this.logger.warn('VAPID set failed '+(e as any).message)}
    } else {
      this.logger.warn('VAPID keys not set - push disabled')
    }

    if (redisUrl) {
      try {
        this.connection = new IORedis(redisUrl, { maxRetriesPerRequest: null, enableReadyCheck: false })
        this.connection.on('error', (e)=> this.logger.warn('Redis error '+e.message))
        this.queue = new Queue('reminders', { connection: this.connection })
        this.worker = new Worker('reminders', async job => {
          const { taskId, userId } = job.data
          await this.sendPushForTask(taskId, userId)
          // reschedule next occurrence for recurring (4h/daily) if task still active
          const task:any = await this.taskModel.findById(taskId).lean()
          if (!task || task.deletedAt || task.status==='completed' || task.status==='cancelled') return
          const next = nextScheduledTime(task, new Date())
          if (next) {
            const delay = Math.max(0, next.getTime() - Date.now())
            // schedule next with delayed job
            await this.queue!.add('push-reminder', { taskId, userId }, { delay, jobId: `${taskId}:next:${next.getTime()}`, removeOnComplete: true, removeOnFail: true })
          }
        }, { connection: this.connection, concurrency: 5 })
        this.worker.on('failed', (job, err)=> this.logger.warn(`Job ${job?.id} failed ${err.message}`))
        this.enabled = true
        this.logger.log('BullMQ reminders queue enabled via '+redisUrl)
      } catch(e:any){
        this.logger.warn('BullMQ init failed, fallback to no-queue mode: '+e.message)
        this.enabled = false
      }
    } else {
      this.logger.warn('REDIS_URL not set - scheduling disabled (foreground only)')
    }
  }

  getVapidPublicKey(): string | null {
    return process.env.VAPID_PUBLIC_KEY || null
  }

  async subscribe(userId: string, subscription: any, deviceName?: string, deviceType?: string) {
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      throw new Error('Invalid push subscription')
    }
    const doc = await this.deviceModel.findOneAndUpdate(
      { userId, 'pushSubscription.endpoint': subscription.endpoint },
      { userId, pushSubscription: subscription, deviceName, deviceType, lastSyncAt: new Date() },
      { upsert: true, new: true }
    )
    // also if not found by endpoint, create separate doc if user already has device by endpoint duplicate handled, else if new endpoint for same user create new doc via upsert already
    // Ensure if upsert created with _id, fine. If user has no device with that endpoint, upsert creates.
    // In case user has no device entry at all but different endpoint, upsert with that endpoint filter creates doc.
    // For redundancy, ensure at least one doc exists
    if (!doc) {
      await this.deviceModel.create({ userId, pushSubscription: subscription, deviceName, deviceType })
    }
    return { subscribed: true }
  }

  async unsubscribe(userId: string, endpoint: string) {
    if (endpoint) {
      await this.deviceModel.deleteMany({ userId, 'pushSubscription.endpoint': endpoint })
    } else {
      await this.deviceModel.deleteMany({ userId, pushSubscription: { $exists: true } })
    }
    return { unsubscribed: true }
  }

  async scheduleForTask(task: any) {
    if (!task || !task._id) return
    const taskId = task._id.toString()
    const userId = task.userId
    // cancel existing pending jobs for this task (best effort: remove by jobId pattern)
    if (this.queue) {
      // remove any job with jobId starting with taskId: (bullmq doesn't support prefix remove, we track via known next jobIds)
      // We try to remove delayed jobs by scanning - best effort: get delayed jobs
      try {
        const delayed = await this.queue.getDelayed()
        for (const j of delayed) {
          if (j.data?.taskId === taskId) await j.remove().catch(()=>{})
        }
      } catch {}
    }
    if (task.deletedAt || task.status==='completed' || task.status==='cancelled') {
      return
    }
    const p = getPriority(task, new Date())
    const freq = getFrequency(p)
    if (freq === 'none') return
    const next = nextScheduledTime(task, new Date())
    if (!next) return
    const delay = Math.max(0, next.getTime() - Date.now())
    if (this.queue) {
      const jobId = `${taskId}:${next.getTime()}`
      try {
        await this.queue.add('push-reminder', { taskId, userId }, { delay, jobId, removeOnComplete: true, removeOnFail: true })
        this.logger.log(`Scheduled push ${taskId} ${p} ${freq} at ${next.toISOString()} delay ${delay}ms`)
      } catch(e:any){
        if (!e.message?.includes('already exists')) this.logger.warn('queue add failed '+e.message)
      }
    } else {
      this.logger.log(`(no queue) Would schedule ${taskId} at ${next.toISOString()} p=${p}`)
    }
  }

  async cancelForTask(taskId: string) {
    if (!this.queue) return
    try {
      const delayed = await this.queue.getDelayed()
      for (const j of delayed) {
        if (j.data?.taskId === taskId) await j.remove().catch(()=>{})
      }
    } catch {}
  }

  async sendPushForTask(taskId: string, userId: string) {
    const task:any = await this.taskModel.findOne({ _id: taskId, userId }).lean()
    if (!task || task.deletedAt || task.status==='completed' || task.status==='cancelled') return
    if (task.snoozedUntil && task.snoozedUntil > Date.now()) return
    if (isQuietHours(new Date())) {
      // reschedule to next allowed instead of sending
      const next = nextAllowedTime(new Date())
      const delay = Math.max(0, next.getTime() - Date.now())
      if (this.queue) await this.queue.add('push-reminder', { taskId, userId }, { delay, jobId: `${taskId}:quiet:${next.getTime()}`, removeOnComplete:true }).catch(()=>{})
      return
    }
    const p = getPriority(task, new Date())
    const deadline = parseDeadline(task)
    const when = deadline.toLocaleString(undefined, { weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit' })
    const payload = JSON.stringify({
      title: `${p.toUpperCase()} — ${task.title}`,
      body: `Due ${when}${task.link ? ' • Tap Start to open link' : ''}`,
      tag: taskId,
      icon: '/pwa-512x512.png',
      badge: '/favicon.svg',
      vibrate: [200,100,200,100,500],
      requireInteraction: p==='critical' || p==='overdue' || true,
      renotify: true,
      actions: [
        { action: 'done', title: '✓ Done' },
        { action: 'start', title: '▶ Start' },
        { action: 'snooze', title: '⏸ Snooze' },
      ],
      data: { taskId, url: task.link || `/tasks/${taskId}`, dueDate: task.dueDate, dueTime: task.dueTime }
    })
    const devices:any[] = await this.deviceModel.find({ userId, pushSubscription: { $exists: true, $ne: null } }).lean()
    for (const d of devices) {
      const sub = d.pushSubscription
      if (!sub?.endpoint) continue
      try {
        await webPush.sendNotification(sub as any, payload, { TTL: 86400 })
      } catch(e:any){
        this.logger.warn(`Push failed ${d._id} ${e.statusCode} ${e.message}`)
        if (e.statusCode === 410 || e.statusCode === 404) {
          await this.deviceModel.deleteOne({ _id: d._id }).catch(()=>{})
        }
      }
    }
    if (devices.length===0) {
      this.logger.log(`No push subscriptions for user ${userId}, task ${taskId} p=${p}`)
    }
  }

  async onModuleDestroy() {
    try { await this.worker?.close() } catch{}
    try { await this.queue?.close() } catch{}
    try { this.connection?.disconnect() } catch{}
  }
}
