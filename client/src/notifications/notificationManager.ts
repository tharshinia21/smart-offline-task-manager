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
    if (now.getHours() >= 23) {
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
    body: `Due ${when}${task.link ? ' • Tap to open' : ''}`,
    tag: task.id,
  }
}

export async function showBrowserNotification(task: Task) {
  const perm = await requestPermission()
  if (perm !== 'granted') return
  const p = getPriority(task, new Date())
  const { title, body, tag } = buildNotificationContent(task, p)
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready
      // No forced vibrate, no alarm sound, silent omitted (platform default)
      await (reg as any).showNotification(title, {
        body,
        tag,
        icon: '/pwa-512x512.png',
        badge: '/favicon.svg',
        requireInteraction: p === 'critical' || p === 'overdue',
        data: { taskId: task.id, url: task.link || `/tasks/${task.id}` },
      })
      return
    }
  } catch {}
  try {
    new Notification(title, { body, tag } as NotificationOptions)
  } catch {}
}

// Minimal push subscription helpers — keep for when server+VAPID+HTTPS available
export async function subscribePush(): Promise<void> {
  // TODO: integrate with Capacitor native layer or server VAPID when HTTPS available
  // For now no-op; do not crash if offline or no VAPID key
  console.warn('[push] subscribePush — not implemented without HTTPS+VAPID setup')
}

export async function syncPushSubscriptionToServer(_sub: any): Promise<void> {
  // no-op without HTTPS+VAPID setup
}

export async function unsubscribePush(): Promise<void> {
  console.warn('[push] unsubscribePush — not implemented without HTTPS+VAPID setup')
}

