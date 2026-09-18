import type { Priority } from '../types/task'
import { priorityMeta } from '../priority/priorityEngine'

export function PriorityBadge({ priority }: { priority: Priority }) {
  const m = priorityMeta(priority)
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${m.bg} ${m.text} border`}>
      <span className={`h-2 w-2 rounded-full ${m.color}`} />
      {m.dot} {m.label}
    </span>
  )
}
