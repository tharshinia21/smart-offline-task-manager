import { BrowserRouter } from 'react-router-dom'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import AppRoutes from './routes/AppRoutes'
import { useEffect } from 'react'
import { db } from './db/database'
import { showBrowserNotification, subscribePush } from './notifications/notificationManager'
import { getPriority } from './priority/priorityEngine'
import { fullSync } from './sync/syncEngine'

export default function App() {
  useEffect(() => {
    // Seed demo tasks if empty (helps first-run demo)
    db.tasks.count().then(async c => {
      if (c === 0) {
        const now = Date.now()
        const today = new Date().toISOString().slice(0, 10)
        const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0,10)
        const in5 = new Date(Date.now()+5*86400000).toISOString().slice(0,10)
        const overdueDate = new Date(Date.now()-2*86400000).toISOString().slice(0,10)
        await db.tasks.bulkPut([
          { id: crypto.randomUUID(), title: 'Complete CN Assignment', dueDate: tomorrow, dueTime: '18:00', link: 'https://example.com/cn', linkName:'example.com', status:'not_started', createdAt:now, updatedAt:now, version:1 },
          { id: crypto.randomUUID(), title: 'DBMS Record', dueDate: in5, dueTime: '09:00', status:'not_started', createdAt:now, updatedAt:now, version:1 },
          { id: crypto.randomUUID(), title: 'Submit Project Report', dueDate: overdueDate, dueTime: '18:00', status:'not_started', createdAt:now, updatedAt:now, version:1 },
          { id: crypto.randomUUID(), title: 'Prepare Presentation', dueDate: today, dueTime: '21:00', status:'in_progress', createdAt:now, updatedAt:now, version:1 },
        ])
      }
    })
    // notification poll: quiet-aware, frequency exact per spec
    const id = setInterval(async ()=>{
      const h=new Date().getHours()
      if(h>=23 || h<7) return // quiet hours
      const tasks = await db.tasks.filter(t=> !t.deletedAt && t.status!=='completed' && t.status!=='cancelled').toArray()
      const now=new Date()
      for(const t of tasks){
        if(t.snoozedUntil && t.snoozedUntil > now.getTime()) continue
        const p=getPriority(t, now)
        const freq = p==='low'?'none': p==='medium'||p==='high'?'daily': p==='very_high'||p==='critical'?'4h':'overdue'
        if(freq==='none') continue
        const key=`lastNotif:${t.id}:${freq}`
        const last=Number(localStorage.getItem(key)||0)
        const should = freq==='daily' ? (Date.now()-last > 24*60*60*1000 && now.getHours()===9) :
                       freq==='4h' ? (Date.now()-last > 4*60*60*1000 && [7,11,15,19].includes(now.getHours())) :
                       freq==='overdue' ? (Date.now()-last > 24*60*60*1000 && now.getHours()===9) : false
        // fallback for demo: also trigger critical/overdue every 4h regardless of hour
        const isUrgentThrottle = (p==='critical'||p==='overdue') && (Date.now()-Number(localStorage.getItem(`lastNotif:${t.id}`)||0) > 4*60*60*1000)
        if(should || isUrgentThrottle){
          localStorage.setItem(key, String(Date.now()))
          localStorage.setItem(`lastNotif:${t.id}`, String(Date.now()))
          showBrowserNotification(t)
        }
      }
    }, 60000)

    // initial sync if online & authenticated + push subscribe for background alarm
    if(navigator.onLine && localStorage.getItem('access_token')){
      fullSync().catch(()=>{})
      if (Notification.permission==='granted') subscribePush().catch(()=>{})
    }
    const onOnline = ()=> { if(localStorage.getItem('access_token')) { fullSync().catch(()=>{}); if(Notification.permission==='granted') subscribePush().catch(()=>{}) } }
    window.addEventListener('online', onOnline)
    return ()=> { clearInterval(id); window.removeEventListener('online', onOnline) }
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-w-0">
            <AppRoutes />
          </main>
        </div>
        <footer className="border-t bg-white p-3 text-center text-xs text-zinc-500">
          Offline-first • IndexedDB (Dexie) ↔ MongoDB (Mongoose) • PWA installable • Priority auto-calculated • Quiet 11PM-7AM
        </footer>
      </div>
    </BrowserRouter>
  )
}
