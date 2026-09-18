import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTask } from '../hooks/useTasks'
import { getPriority, priorityMeta } from '../priority/priorityEngine'
import { PriorityBadge } from '../components/PriorityBadge'
import { TaskStatusBadge } from '../components/TaskStatus'
import { NotificationPreview } from '../components/NotificationPreview'

export default function TaskDetails(){
  const { taskId } = useParams()
  const task = useTask(taskId)
  const nav = useNavigate()
  if(!task) return <div className="mx-auto max-w-xl p-4">Loading...</div>
  const priority=getPriority(task)
  const meta=priorityMeta(priority)

  const updateStatus = async (status: Task['status'])=>{
    const { updateTask } = await import('../db/database')
    await updateTask(task.id, { status, completedAt: status==='completed'?Date.now(): undefined })
  }

  const snooze = async (mins:number)=>{
    const until = Date.now()+ mins*60000
    const { updateTask } = await import('../db/database')
    await updateTask(task.id, { snoozedUntil: until })
    alert(`Snoozed for ${mins} minutes`)
  }

  const del = async()=>{
    if(!confirm('Delete task?')) return
    const { softDeleteTask } = await import('../db/database')
    await softDeleteTask(task.id)
    nav('/dashboard')
  }

  return (
    <div className="mx-auto max-w-xl p-4">
      <h1 className="text-2xl font-bold truncate">{task.title}</h1>
      <div className="mt-2"><PriorityBadge priority={priority}/></div>
      <div className="mt-4 rounded-2xl border bg-white p-4 space-y-3">
        <div>
          <p className="text-xs text-zinc-500">Due</p>
          <p className="font-semibold">{task.dueDate} at {task.dueTime}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Status</p>
          <TaskStatusBadge status={task.status} />
        </div>
        {task.link && <div>
          <p className="text-xs text-zinc-500">Link</p>
          <a href={task.link} target="_blank" rel="noreferrer" className="text-indigo-600 underline break-all">{task.linkName || task.link} — {task.link}</a>
        </div>}
        <div className="text-xs text-zinc-500">Created {new Date(task.createdAt).toLocaleString()} • Updated {new Date(task.updatedAt).toLocaleString()}</div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={()=>updateStatus('in_progress')} className="rounded-xl bg-indigo-600 py-3 font-semibold text-white">▶ Start {task.link && '& Open Link'}</button>
        <button onClick={()=>updateStatus('completed')} className="rounded-xl bg-green-600 py-3 font-semibold text-white">✓ Complete</button>
        <button onClick={()=>snooze(30)} className="rounded-xl border bg-white py-3 font-semibold">⏸ Snooze 30m</button>
        <Link to={`/tasks/${task.id}/edit`} className="rounded-xl border bg-white py-3 text-center font-semibold">📅 Reschedule</Link>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button onClick={()=>snooze(60)} className="rounded-xl border bg-white py-2 text-sm">Snooze 1h</button>
        <button onClick={()=>snooze(240)} className="rounded-xl border bg-white py-2 text-sm">Snooze 4h</button>
        <button onClick={()=>updateStatus('cancelled')} className="rounded-xl border bg-white py-2 text-sm">🚫 Cancel</button>
        <button onClick={del} className="rounded-xl bg-red-50 py-2 text-sm font-semibold text-red-600">Delete</button>
      </div>
      {task.link && <button onClick={()=>window.open(task.link,'_blank')} className="mt-3 w-full rounded-xl border bg-white py-3 font-semibold text-indigo-600">🔗 Open {task.linkName || 'Link'}</button>}
      <div className={`mt-4 rounded-xl p-3 text-sm ${meta.bg} ${meta.text}`}>Reminder: {priority==='low'?'No frequent reminders':priority==='medium'||priority==='high'?'Daily at 9AM':priority==='very_high'||priority==='critical'?'Every 4h (7AM-11PM, quiet 11PM-7AM)':'Overdue — daily until completed'}</div>
      <div className="mt-4">
        <p className="text-xs font-semibold text-zinc-500 mb-2">Notification preview (offline-aware)</p>
        <NotificationPreview task={task} priority={priority} />
      </div>
    </div>
  )
}
import type { Task } from '../types/task'
