import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getPendingSyncCount, isOnline, fullSync } from '../sync/syncEngine'

export function Header() {
  const loc = useLocation()
  const nav = useNavigate()
  const [syncCount, setSyncCount] = useState(0)
  const [online, setOnline] = useState(isOnline())
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string>(localStorage.getItem('lastSyncAt')||'')

  useEffect(() => {
    const on = () => setOnline(navigator.onLine)
    window.addEventListener('online', on)
    window.addEventListener('offline', on)
    const id = setInterval(async () => {
      setSyncCount(await getPendingSyncCount())
      setLastSync(localStorage.getItem('lastSyncAt')||'')
    }, 2000)
    // auto-sync when coming online
    window.addEventListener('online', async ()=> {
      setSyncing(true)
      await fullSync().finally(()=> setSyncing(false))
    })
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', on); clearInterval(id) }
  }, [])

  const doSync = async ()=>{
    if(!online) return
    setSyncing(true)
    const r = await fullSync()
    setSyncing(false)
    if(r.conflicts?.length) alert(`Sync: ${r.pushed} pushed, ${r.pulled} pulled — ${r.conflicts.length} conflict(s) server-wins`)
  }

  const hideBack = loc.pathname === '/dashboard' || loc.pathname === '/'
  let status: { text: string; cls: string } = { text: '✓ Synced', cls: 'bg-green-50 text-green-700' }
  if (syncing) status = { text: '↻ Syncing…', cls: 'bg-blue-50 text-blue-700' }
  else if (!online) status = { text: `⚠ Offline — ${syncCount} queued`, cls: 'bg-amber-50 text-amber-700' }
  else if (syncCount>0) status = { text: `↻ ${syncCount} to sync`, cls: 'bg-amber-50 text-amber-700' }

  return (
    <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          {!hideBack && <button onClick={() => nav(-1)} className="rounded-full border px-3 py-1 text-sm">← Back</button>}
          <Link to="/dashboard" className="font-bold text-indigo-600">Smart Tasks</Link>
          <button onClick={doSync} title={lastSync? `Last sync ${new Date(Number(lastSync)).toLocaleString()}`: undefined} className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs border ${status.cls}`}>
            {status.text}
          </button>
        </div>
        <nav className="flex items-center gap-1 text-sm">
          <Link to="/tasks" className={`rounded-full px-3 py-1.5 ${loc.pathname.startsWith('/tasks') ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-100'}`}>Tasks</Link>
          <Link to="/calendar" className={`rounded-full px-3 py-1.5 ${loc.pathname === '/calendar' ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-100'}`}>Calendar</Link>
          <Link to="/focus" className={`rounded-full px-3 py-1.5 ${loc.pathname === '/focus' ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-100'}`}>Focus</Link>
          <Link to="/statistics" className={`rounded-full px-3 py-1.5 ${loc.pathname === '/statistics' ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-100'}`}>Stats</Link>
          <Link to="/settings" className="rounded-full border px-3 py-1.5 hover:bg-zinc-50">⚙</Link>
        </nav>
      </div>
    </header>
  )
}
