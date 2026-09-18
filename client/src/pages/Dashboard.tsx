import { Link } from 'react-router-dom'
import { useTasks } from '../hooks/useTasks'
import { getPriority, sortByUrgency } from '../priority/priorityEngine'
import { TaskCard } from '../components/TaskCard'

export default function Dashboard() {
  const tasks = useTasks()
  const now = new Date()
  const active = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled' && !t.deletedAt)
  const today = active.filter(t => getPriority(t, now) === 'critical' || (() => {
    try { const d = new Date(`${t.dueDate}T${t.dueTime}:00`); return d.toDateString() === now.toDateString() } catch { return false }
  })())
  const overdue = active.filter(t => getPriority(t, now) === 'overdue')
  const upcoming = active.filter(t => !['critical','overdue'].includes(getPriority(t, now))).length
  const sorted = [...active].sort((a,b)=>sortByUrgency(a,b,now)).slice(0,5)

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Good morning! 👋</h1>
        <p className="text-zinc-500">Your smart task overview — works offline</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Link to="/tasks/today" className="rounded-2xl bg-white border p-4 text-center hover:shadow">
          <div className="text-3xl font-bold">{today.length}</div><div className="text-sm text-zinc-500">Today</div>
        </Link>
        <Link to="/tasks/upcoming" className="rounded-2xl bg-white border p-4 text-center hover:shadow">
          <div className="text-3xl font-bold">{upcoming}</div><div className="text-sm text-zinc-500">Upcoming</div>
        </Link>
        <Link to="/tasks/overdue" className="rounded-2xl bg-white border p-4 text-center hover:shadow">
          <div className={`text-3xl font-bold ${overdue.length?'text-red-600':''}`}>{overdue.length}</div><div className="text-sm text-zinc-500">Overdue</div>
        </Link>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-semibold">Most urgent</h2>
        <Link to="/tasks/new" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">+ Add Task</Link>
      </div>

      <div className="mt-3 grid gap-3">
        {sorted.length===0 ? <div className="rounded-2xl border bg-white p-8 text-center text-zinc-500">No tasks yet. Create one to see priority automation.</div> : sorted.map(t=> <TaskCard key={t.id} task={t} />)}
      </div>

      <div className="mt-6 rounded-xl bg-zinc-900 p-4 text-white">
        <p className="font-semibold">How priority works</p>
        <p className="text-sm text-zinc-300">15+ days Low → 7-14 Medium → 3-6 High → 1-2 Very High → Due today Critical → Overdue. No manual priority needed.</p>
      </div>
    </div>
  )
}
