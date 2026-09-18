import type { Task, Priority } from '../types/task'
import { priorityMeta, parseDeadline } from '../priority/priorityEngine'

export function NotificationPreview({ task, priority }: { task: Task; priority: Priority }) {
  const meta = priorityMeta(priority)
  const when = parseDeadline(task).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  return (
    <div className="rounded-2xl border bg-white shadow-lg overflow-hidden max-w-sm">
      <div className={`px-4 py-2 text-xs font-bold tracking-wide ${meta.bg} ${meta.text} flex items-center gap-2`}>
        <span className={`h-2 w-2 rounded-full ${meta.color}`} />
        {meta.dot} {meta.label} PRIORITY
      </div>
      <div className="p-4">
        <p className="font-semibold text-zinc-900 truncate">{task.title}</p>
        <p className="text-sm text-zinc-500">Due {when}</p>
        {task.link && <p className="mt-1 text-xs text-indigo-600 truncate">🔗 {task.linkName || task.link}</p>}
        <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
          <span className="rounded-full bg-green-50 border px-2 py-1.5 text-center font-semibold text-green-700">✓ Done</span>
          <span className="rounded-full bg-indigo-50 border px-2 py-1.5 text-center font-semibold text-indigo-700">▶ Start</span>
          <span className="rounded-full bg-zinc-50 border px-2 py-1.5 text-center font-semibold">⏸ Snooze</span>
          <span className="rounded-full bg-zinc-50 border px-2 py-1.5 text-center font-semibold">📅 Reschedule</span>
        </div>
        {task.link && <div className="mt-2 text-xs text-center text-indigo-600">🔗 Open {task.linkName || 'Link'}</div>}
      </div>
    </div>
  )
}
