import { useTasks } from '../hooks/useTasks'
import { getPriority } from '../priority/priorityEngine'
import { TaskCard } from '../components/TaskCard'

export default function UpcomingTasks() {
  const tasks = useTasks()
  const now=new Date()
  const filtered = tasks.filter(t=> !t.deletedAt && t.status!=='completed' && t.status!=='cancelled' && !['critical','overdue'].includes(getPriority(t,now)) && getPriority(t,now)!=='overdue' && (()=>{try{return new Date(`${t.dueDate}T${t.dueTime}:00`).getTime()>now.getTime()}catch{return false}})() )
  // Fallback: if date logic fails, just show active not today/overdue
  const fallback = tasks.filter(t=> !t.deletedAt && t.status!=='completed' && t.status!=='cancelled' && !['critical','overdue'].includes(getPriority(t,now)))

  const list = filtered.length? filtered: fallback

  return (
    <div className="mx-auto max-w-6xl p-4">
      <h1 className="text-2xl font-bold">Upcoming</h1>
      <div className="mt-4 grid gap-3">
        {list.length===0? <div className="rounded-2xl border bg-white p-8 text-center text-zinc-500">No upcoming tasks</div> : list.map(t=> <TaskCard key={t.id} task={t}/>)}
      </div>
    </div>
  )
}
