import type { TaskStatus } from '../types/task'

const map: Record<TaskStatus, { label: string; dot: string; bg: string; text: string }> = {
  not_started: { label: 'Not Started', dot: '⭕', bg: 'bg-zinc-100', text: 'text-zinc-700' },
  in_progress: { label: 'In Progress', dot: '🔵', bg: 'bg-blue-50', text: 'text-blue-700' },
  completed: { label: 'Completed', dot: '✅', bg: 'bg-green-50', text: 'text-green-700' },
  cancelled: { label: 'Cancelled', dot: '🚫', bg: 'bg-red-50', text: 'text-red-700' },
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const m = map[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${m.bg} ${m.text} border`}>
      {m.dot} {m.label}
    </span>
  )
}
