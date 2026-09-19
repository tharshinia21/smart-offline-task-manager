/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'

// @ts-ignore self is ServiceWorkerGlobalScope
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('push', (event: any) => {
  let data:any = {}
  try { data = event.data ? event.data.json() : {} } catch { data = { title: event.data?.text() || 'Reminder', body: '' } }
  const title = data.title || 'Task Reminder'
  const options: any = {
    body: data.body || '',
    tag: data.tag || 'task',
    icon: data.icon || '/pwa-512x512.png',
    badge: data.badge || '/favicon.svg',
    vibrate: data.vibrate || [200,100,200,100,500],
    requireInteraction: data.requireInteraction ?? true,
    renotify: data.renotify ?? true,
    silent: data.silent ?? false,
    actions: data.actions || [{action:'done',title:'✓ Done'},{action:'start',title:'▶ Start'},{action:'snooze',title:'⏸ Snooze'}],
    data: data.data || { url: '/' },
  }
  event.waitUntil((self as any).registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event:any)=>{
  event.notification.close()
  const action = event.action
  const data = event.notification.data || {}
  const taskId = data.taskId || event.notification.tag
  const url = data.url
  event.waitUntil((async()=>{
    const all = await (self as any).clients.matchAll({type:'window', includeUncontrolled:true})
    const client = all.find((c:any)=> 'focus' in c)
    if (action === 'done' && taskId) {
      // try to complete via fetch (requires auth, may fail offline - SW will still open)
      try { await fetch(`/api/tasks/${taskId}/complete`, {method:'POST', credentials:'include'}) } catch {}
      const target = `/tasks/${taskId}`
      if (client) { await client.focus(); (client as any).navigate?.(target) } else await (self as any).clients.openWindow(target)
      return
    }
    if (action === 'start') {
      if (url && url.startsWith('http')) { await (self as any).clients.openWindow(url); return }
      const target = `/tasks/${taskId}`
      if (client) { await client.focus(); (client as any).navigate?.(target) } else await (self as any).clients.openWindow(target)
      return
    }
    if (action === 'snooze' && taskId) {
      try { await fetch(`/api/tasks/${taskId}/snooze`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({minutes:60})}) } catch {}
      return
    }
    // default click
    const target = taskId ? `/tasks/${taskId}` : '/'
    if (client) { await client.focus(); (client as any).navigate?.(target) } else await (self as any).clients.openWindow(target)
  })())
})
