import { useTasks } from '../hooks/useTasks'
import { TaskCard } from '../components/TaskCard'

export default function CompletedTasks(){
  const tasks=useTasks()
  const filtered=tasks.filter(t=> t.status==='completed' && !t.deletedAt)
  return (
    <div className="mx-auto max-w-6xl p-4">
      <h1 className="text-2xl font-bold">Completed ✅</h1>
      <div className="mt-4 grid gap-3">
        {filtered.length===0? <div className="rounded-2xl border bg-white p-8 text-center text-zinc-500">No completed tasks yet</div> : filtered.map(t=> <TaskCard key={t.id} task={t}/>)}
      </div>
    </div>
  )
}
