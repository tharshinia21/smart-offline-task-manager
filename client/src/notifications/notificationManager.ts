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

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i=0;i<raw.length;++i) output[i]=raw.charCodeAt(i)
  return output
}

export async function subscribePush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null
  const perm = await requestPermission()
  if (perm !== 'granted') return null
  const reg = await navigator.serviceWorker.ready
  const existing = await reg.pushManager.getSubscription()
  if (existing) return existing
  // fetch VAPID public key from server
  let vapid = (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY as string | undefined
  if (!vapid) {
    try {
      const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api'
      const token = localStorage.getItem('access_token')
      const res = await fetch(`${API}/notifications/vapid-public-key`, { headers: token? { Authorization: `Bearer ${token}` }: {} })
      if (res.ok) { const j=await res.json(); vapid=j.publicKey }
    } catch {}
  }
  if (!vapid) return null
  try {
    return await reg.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey: urlBase64ToUint8Array(vapid) } as any)
  } catch { return null }
}

export async function syncPushSubscriptionToServer(sub: PushSubscription){
  const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api'
  const token = localStorage.getItem('access_token')
  if (!token) return
  await fetch(`${API}/notifications/subscribe`, { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body: JSON.stringify({ subscription: sub.toJSON(), deviceName: navigator.userAgent.slice(0,120), deviceType: /Mobi|Android/i.test(navigator.userAgent)?'mobile':'desktop' }) }).catch(()=>{})
}

export async function unsubscribePush(){
  if (!('serviceWorker' in navigator)) return
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  if (!sub) return
  const endpoint = (sub as any).endpoint
  await sub.unsubscribe().catch(()=>{})
  const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api'
  const token = localStorage.getItem('access_token')
  if (token) await fetch(`${API}/notifications/subscribe`, { method:'DELETE', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body: JSON.stringify({ endpoint }) }).catch(()=>{})
}

export async function showBrowserNotification(task: Task) {
  const perm = await requestPermission()
  if (perm !== 'granted') return
  const p = getPriority(task, new Date())
  const { title, body, tag } = buildNotificationContent(task, p)
  // Prefer SW showNotification for alarm-like (vibrate, actions, sticky)
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready
      // @ts-ignore
      await (reg as any).showNotification(title, {
        body, tag, icon:'/pwa-512x512.png', badge:'/favicon.svg',
        vibrate: [200,100,200,100,500], requireInteraction: true, renotify: true, silent:false,
        data:{ taskId: task.id, url: task.link || `/tasks/${task.id}` },
        actions: [{action:'done', title:'✓ Done'}, {action:'start', title:'▶ Start'}, {action:'snooze', title:'⏸ Snooze'}]
      })
      // alarm sound for critical/overdue via Audio (best effort, may need gesture)
      if (p==='critical' || p==='overdue') {
        try { const a=new Audio('/alarm.wav'); a.volume=0.9; a.play().catch(()=>{}); if(navigator.vibrate) navigator.vibrate([400,100,400]) } catch {}
      }
      return
    }
  } catch {}
  try {
    new Notification(title, { body, tag, requireInteraction: true } as NotificationOptions)
    if (navigator.vibrate) navigator.vibrate([200,100,200])
  } catch {}
}
