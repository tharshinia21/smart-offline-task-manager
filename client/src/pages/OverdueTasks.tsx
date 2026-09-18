import { useTasks } from '../hooks/useTasks'
import { getPriority } from '../priority/priorityEngine'
import { TaskCard } from '../components/TaskCard'

export default function OverdueTasks(){
  const tasks=useTasks()
  const now=new Date()
  const filtered=tasks.filter(t=> !t.deletedAt && t.status!=='completed' && t.status!=='cancelled' && getPriority(t,now)==='overdue')
  return (
    <div className="mx-auto max-w-6xl p-4">
      <h1 className="text-2xl font-bold">Overdue ⚠️</h1>
      <div className="mt-4 grid gap-3">
        {filtered.length===0? <div className="rounded-2xl border bg-white p-8 text-center text-zinc-500">No overdue tasks 🎉</div> : filtered.map(t=> <TaskCard key={t.id} task={t}/>)}
      </div>
    </div>
  )
}
