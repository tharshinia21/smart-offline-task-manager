import { useTasks } from '../hooks/useTasks'
import { getPriority } from '../priority/priorityEngine'
import { TaskCard } from '../components/TaskCard'

export default function TodayTasks() {
  const tasks = useTasks()
  const now = new Date()
  const filtered = tasks.filter(t=> !t.deletedAt && t.status!=='completed' && t.status!=='cancelled' && (()=>{ try{ const d=new Date(`${t.dueDate}T${t.dueTime}:00`); return d.toDateString()===now.toDateString() || getPriority(t,now)==='critical'}catch{return false}})())

  return (
    <div className="mx-auto max-w-6xl p-4">
      <h1 className="text-2xl font-bold">Today</h1>
      <div className="mt-4 grid gap-3">
        {filtered.length===0? <div className="rounded-2xl border bg-white p-8 text-center text-zinc-500">No tasks due today 🎉</div> : filtered.map(t=> <TaskCard key={t.id} task={t}/>)}
      </div>
    </div>
  )
}
