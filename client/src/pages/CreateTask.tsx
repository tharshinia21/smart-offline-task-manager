import { useNavigate } from 'react-router-dom'
import { TaskForm } from '../components/TaskForm'
import { db } from '../db/database'
import { deriveLinkName } from '../priority/priorityEngine'

export default function CreateTask(){
  const nav=useNavigate()
  const onSubmit = async (data:{title:string; dueDate:string; dueTime:string; link?:string})=>{
    const id = crypto.randomUUID()
    const now=Date.now()
    await db.tasks.put({
      id, title:data.title, dueDate:data.dueDate, dueTime:data.dueTime,
      link:data.link, linkName:data.link? deriveLinkName(data.link): undefined,
      status:'not_started', createdAt:now, updatedAt:now, version:1
    })
    await db.syncQueue.add({ taskId:id, operation:'create', payload: await db.tasks.get(id) as any, timestamp:now, version:1 })
    nav(`/tasks/${id}`)
  }
  return (
    <div className="mx-auto max-w-xl p-4">
      <h1 className="text-2xl font-bold">Add Task</h1>
      <p className="text-sm text-zinc-500">Priority calculated automatically. Works offline.</p>
      <div className="mt-4 rounded-2xl border bg-white p-4">
        <TaskForm onSubmit={onSubmit} submitLabel="Add Task" />
      </div>
    </div>
  )
}
