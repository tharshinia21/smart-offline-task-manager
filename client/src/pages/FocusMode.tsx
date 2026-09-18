import { useTasks } from '../hooks/useTasks'
import { getPriority, sortByUrgency } from '../priority/priorityEngine'
import { TaskCard } from '../components/TaskCard'

export default function FocusMode(){
  const tasks=useTasks()
  const now=new Date()
  const urgent = tasks.filter(t=> !t.deletedAt && t.status!=='completed' && t.status!=='cancelled')
    .sort((a,b)=>sortByUrgency(a,b,now))
    .filter(t=> ['overdue','critical','very_high'].includes(getPriority(t,now)))
    .slice(0,5)
  const fallback = tasks.filter(t=> !t.deletedAt && t.status!=='completed').sort((a,b)=>sortByUrgency(a,b,now)).slice(0,5)
  const list = urgent.length? urgent: fallback
  return (
    <div className="mx-auto max-w-xl p-4">
      <h1 className="text-2xl font-bold">Focus Mode 🎯</h1>
      <p className="text-zinc-500">Most relevant tasks by urgency</p>
      <div className="mt-4 grid gap-3">
        {list.length===0? <div className="rounded-2xl border bg-white p-8 text-center text-zinc-500">No tasks to focus</div> : list.map(t=> <TaskCard key={t.id} task={t}/>)}
      </div>
      {list.length>0 && <button onClick={()=>{ if('Notification' in window) Notification.requestPermission(); alert('Focus session: work on top task, snooze others. (MVP)')}} className="mt-4 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white">Start Focus Session</button>}
    </div>
  )
}
