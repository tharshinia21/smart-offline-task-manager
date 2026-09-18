import { Link, useLocation } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { useTasks } from '../hooks/useTasks'
import { TaskCard } from '../components/TaskCard'
import { sortByUrgency } from '../priority/priorityEngine'

const tabs = [
  { to: '/tasks', label: 'All' },
  { to: '/tasks/today', label: 'Today' },
  { to: '/tasks/upcoming', label: 'Upcoming' },
  { to: '/tasks/overdue', label: 'Overdue' },
  { to: '/tasks/completed', label: 'Completed' },
]

export default function Tasks() {
  const tasks = useTasks()
  const loc = useLocation()
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'urgency'|'due'>('urgency')
  const active = useMemo(()=>{
    let list = tasks.filter(t=>!t.deletedAt)
    if (q.trim()) {
      const s = q.toLowerCase()
      list = list.filter(t=> t.title.toLowerCase().includes(s) || (t.link && t.link.toLowerCase().includes(s)) || (t.linkName && t.linkName.toLowerCase().includes(s)))
    }
    if (sort==='urgency') list = [...list].sort((a,b)=>sortByUrgency(a,b))
    else list = [...list].sort((a,b)=> new Date(`${a.dueDate}T${a.dueTime}:00`).getTime() - new Date(`${b.dueDate}T${b.dueTime}:00`).getTime())
    return list
  }, [tasks, q, sort])

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Link to="/tasks/new" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">+ Add Task</Link>
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {tabs.map(t=>(
          <Link key={t.to} to={t.to} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm border ${loc.pathname===t.to?'bg-zinc-900 text-white border-zinc-900':'bg-white'}`}>{t.label}</Link>
        ))}
      </div>
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search title or link (offline) 🔍" className="w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          {q && <button onClick={()=>setQ('')} className="absolute right-3 top-2.5 text-xs text-zinc-400">✕</button>}
        </div>
        <select value={sort} onChange={e=>setSort(e.target.value as any)} className="rounded-xl border bg-white px-3 py-2.5 text-sm">
          <option value="urgency">Sort: Urgency</option>
          <option value="due">Sort: Due date</option>
        </select>
      </div>
      <p className="mt-2 text-xs text-zinc-500">{active.length} task{active.length!==1?'s':''} • Offline search via IndexedDB • Priority auto-sorted</p>
      <div className="mt-4 grid gap-3">
        {active.length===0? <div className="rounded-2xl border bg-white p-8 text-center text-zinc-500">{q?`No matches for "${q}"`:'No tasks. Add one!'}</div> : active.map(t=> <TaskCard key={t.id} task={t} />)}
      </div>
    </div>
  )
}
