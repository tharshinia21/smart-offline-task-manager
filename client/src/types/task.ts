export type ReminderStatus = 'scheduled' | 'sent' | 'snoozed' | 'completed' | 'cancelled'

export type Reminder = {
  reminderId: string
  taskId: string
  scheduledAt: number // timestamp
  status: ReminderStatus
  snoozeUntil?: number
}

export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'cancelled'
export type Priority = 'low' | 'medium' | 'high' | 'very_high' | 'critical' | 'overdue'

export interface Task {
  id: string
  title: string
  dueDate: string // ISO date YYYY-MM-DD
  dueTime: string // HH:mm (24h)
  link?: string
  linkName?: string
  status: TaskStatus
  createdAt: number
  updatedAt: number
  completedAt?: number
  version: number
  deletedAt?: number
  snoozedUntil?: number
  // Optional reminder time independent of due date/time
  reminderAt?: number // timestamp (ms) — set via UI
  // Reference to active reminder for offline dedup
  activeReminderId?: string
}

export interface SyncQueueItem {
  id?: number
  taskId: string
  operation: 'create' | 'update' | 'delete'
  payload: Task | { id: string }
  timestamp: number
  version: number
}
