import type { Priority, Task } from '../types/task'
import { getPriority, parseDeadline } from '../priority/priorityEngine'

export type ReminderFrequency = 'none' | 'daily' | '4h' | 'overdue'

export function getFrequency(p: Priority): ReminderFrequency {
  switch (p) {
    case 'low': return 'none'
    case 'medium': return 'daily'
    case 'high': return 'daily'
    case 'very_high': return '4h'
    case 'critical': return '4h'
    case 'overdue': return 'overdue'
  }
}

export function isQuietHours(now = new Date()): boolean {
  const h = now.getHours()
  // 23:00 -> 06:59 quiet
  return h >= 23 || h < 7
}

export function nextAllowedTime(now = new Date()): Date {
  const n = new Date(now)
  if (!isQuietHours(n)) return n
  // next 7:00 AM
  n.setHours(7, 0, 0, 0)
  if (n.getHours() === 7 && now.getHours() >= 23) {
    // if 23+ -> next day 7am already set, but if now is 23:xx, set to next day 7am
    // n is same day 7am which is in past, so add 1 day
    if (now.getHours() >= 23) {
      // n is today 07:00 which is < now, move to tomorrow
      // Actually new Date(now) at 23:xx, setHours(7) -> today 07:00 <23:xx, need +1 day
      if (n.getTime() <= now.getTime()) n.setDate(n.getDate() + 1)
    }
  } else if (n.getTime() <= now.getTime()) {
    n.setDate(n.getDate() + 1)
    n.setHours(7, 0, 0, 0)
  }
  return n
}

export function shouldNotify(task: Task, now = new Date()): boolean {
  if (task.status === 'completed' || task.status === 'cancelled') return false
  if (task.snoozedUntil && task.snoozedUntil > now.getTime()) return false
  if (isQuietHours(now)) return false
  return true
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  return await Notification.requestPermission()
}

export function buildNotificationContent(task: Task, priority: Priority) {
  const deadline = parseDeadline(task)
  const when = deadline.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  return {
    title: `${priority.toUpperCase()} — ${task.title}`,
    body: `Due ${when}${task.link ? ' • Tap Start to open link' : ''}`,
    tag: task.id,
  }
}

let timer: number | null = null

export function startReminderLoop(onNotify: (task: Task) => void, getTasks: () => Promise<Task[]>) {
  if (timer) window.clearInterval(timer)
  const tick = async () => {
    if (isQuietHours(new Date())) return
    const tasks = await getTasks()
    const now = new Date()
    for (const t of tasks) {
      if (t.status === 'completed' || t.status === 'cancelled') continue
      const p = getPriority(t, now)
      const freq = getFrequency(p)
      if (freq === 'none') continue
      if (!shouldNotify(t, now)) continue
      if (freq === 'daily') {
        if (now.getHours() === 9 && now.getMinutes() < 1) onNotify(t)
      } else if (freq === '4h') {
        if ([7, 11, 15, 19].includes(now.getHours()) && now.getMinutes() < 1) onNotify(t)
      } else if (freq === 'overdue') {
        if (now.getHours() === 9 && now.getMinutes() < 1) onNotify(t)
      }
    }
  }
  timer = window.setInterval(tick, 60 * 1000)
  tick()
  return () => { if (timer) window.clearInterval(timer) }
}

export async function showBrowserNotification(task: Task) {
  const perm = await requestPermission()
  if (perm !== 'granted') return
  const p = getPriority(task, new Date())
  const { title, body, tag } = buildNotificationContent(task, p)
  try {
    new Notification(title, { body, tag, requireInteraction: p === 'critical' || p === 'overdue' } as NotificationOptions)
  } catch {}
}
