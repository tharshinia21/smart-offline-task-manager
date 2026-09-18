import { Link } from 'react-router-dom'
import type { Task } from '../types/task'
import { getPriority, getDisplayDue, deriveLinkName } from '../priority/priorityEngine'
import { PriorityBadge } from './PriorityBadge'

export function TaskCard({ task }: { task: Task }) {
  const priority = getPriority(task)
  return (
    <Link to={`/tasks/${task.id}`} className="block rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-zinc-900">{task.title}</p>
          <p className="text-sm text-zinc-500">Due {getDisplayDue(task)}</p>
          {task.link && (
            <p className="mt-1 text-xs text-indigo-600 truncate flex items-center gap-1">
              🔗 {task.linkName || deriveLinkName(task.link)}
            </p>
          )}
        </div>
        <PriorityBadge priority={priority} />
      </div>
      <div className="mt-2 flex gap-2 text-xs">
        <span className="rounded-full bg-zinc-100 px-2 py-1 capitalize">{task.status.replace('_', ' ')}</span>
      </div>
    </Link>
  )
}
