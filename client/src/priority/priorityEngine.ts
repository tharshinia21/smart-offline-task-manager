import type { Priority, Task } from '../types/task'

export function parseDeadline(task: Task): Date {
  // dueDate: YYYY-MM-DD, dueTime: HH:mm
  return new Date(`${task.dueDate}T${task.dueTime}:00`)
}

export function getTimeRemainingMs(task: Task, now: Date = new Date()): number {
  const deadline = parseDeadline(task)
  return deadline.getTime() - now.getTime()
}

export function getDaysRemaining(task: Task, now: Date = new Date()): number {
  return getTimeRemainingMs(task, now) / (1000 * 60 * 60 * 24)
}

export function getPriority(task: Task, now: Date = new Date()): Priority {
  const remaining = getTimeRemainingMs(task, now)
  if (remaining < 0) return 'overdue'
  // Due today has highest urgency before overdue per spec
  if (isSameDay(parseDeadline(task), now)) return 'critical'
  // Use ceil to match spec integer day buckets: 1-2, 3-6, 7-14, 15+
  const days = Math.ceil(remaining / (1000 * 60 * 60 * 24))
  if (days >= 15) return 'low'
  if (days >= 7) return 'medium'
  if (days >= 3) return 'high'
  if (days >= 1) return 'very_high'
  return 'critical'
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function priorityMeta(p: Priority) {
  switch (p) {
    case 'low': return { label: 'LOW', color: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50', dot: '🟢' }
    case 'medium': return { label: 'MEDIUM', color: 'bg-yellow-400', text: 'text-yellow-700', bg: 'bg-yellow-50', dot: '🟡' }
    case 'high': return { label: 'HIGH', color: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50', dot: '🟠' }
    case 'very_high': return { label: 'VERY HIGH', color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', dot: '🔴' }
    case 'critical': return { label: 'CRITICAL', color: 'bg-red-700', text: 'text-red-800', bg: 'bg-red-100', dot: '🚨' }
    case 'overdue': return { label: 'OVERDUE', color: 'bg-zinc-800', text: 'text-zinc-800', bg: 'bg-zinc-100', dot: '⚠️' }
  }
}

export function sortByUrgency(a: Task, b: Task, now = new Date()): number {
  const order: Record<Priority, number> = { overdue: 0, critical: 1, very_high: 2, high: 3, medium: 4, low: 5 }
  const pa = getPriority(a, now)
  const pb = getPriority(b, now)
  if (order[pa] !== order[pb]) return order[pa] - order[pb]
  return parseDeadline(a).getTime() - parseDeadline(b).getTime()
}

export function getDisplayDue(task: Task): string {
  try {
    const d = parseDeadline(task)
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  } catch { return `${task.dueDate} ${task.dueTime}` }
}

export function deriveLinkName(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}
