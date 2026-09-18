import { useParams, useNavigate } from 'react-router-dom'
import { useTask } from '../hooks/useTasks'
import { TaskForm } from '../components/TaskForm'
import { deriveLinkName } from '../priority/priorityEngine'

export default function EditTask(){
  const { taskId } = useParams()
  const task = useTask(taskId)
  const nav=useNavigate()
  if(!task) return <div className="p-4">Loading...</div>
  const onSubmit = async (data:{title:string; dueDate:string; dueTime:string; link?:string})=>{
    const { updateTask } = await import('../db/database')
    await updateTask(task.id, { title:data.title, dueDate:data.dueDate, dueTime:data.dueTime, link:data.link, linkName:data.link? deriveLinkName(data.link): undefined })
    nav(`/tasks/${task.id}`)
  }
  return (
    <div className="mx-auto max-w-xl p-4">
      <h1 className="text-2xl font-bold">Edit Task</h1>
      <div className="mt-4 rounded-2xl border bg-white p-4">
        <TaskForm initial={task} onSubmit={onSubmit} submitLabel="Save Changes" />
      </div>
    </div>
  )
}
