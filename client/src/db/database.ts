import Dexie, { type Table } from 'dexie'
import type { Task, SyncQueueItem } from '../types/task'

class TaskDatabase extends Dexie {
  tasks!: Table<Task, string>
  syncQueue!: Table<SyncQueueItem, number>

  constructor() {
    super('SmartTaskDB')
    this.version(1).stores({
      tasks: 'id, dueDate, status, updatedAt, createdAt',
      syncQueue: '++id, taskId, timestamp',
    })
  }
}

export const db = new TaskDatabase()

// helpers
export async function getAllTasks(): Promise<Task[]> {
  return db.tasks.filter(t => !t.deletedAt).toArray()
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  return db.tasks.get(id)
}

export async function saveTask(task: Task, queue: boolean = true) {
  await db.tasks.put(task)
  if (queue) {
    await db.syncQueue.add({
      taskId: task.id,
      operation: 'create',
      payload: task,
      timestamp: Date.now(),
      version: task.version,
    })
  }
}

export async function updateTask(id: string, patch: Partial<Task>) {
  const existing = await db.tasks.get(id)
  if (!existing) return
  const updated: Task = { ...existing, ...patch, updatedAt: Date.now(), version: existing.version + 1 }
  await db.tasks.put(updated)
  await db.syncQueue.add({
    taskId: id,
    operation: 'update',
    payload: updated,
    timestamp: Date.now(),
    version: updated.version,
  })
  return updated
}

export async function softDeleteTask(id: string) {
  const existing = await db.tasks.get(id)
  if (!existing) return
  const updated: Task = { ...existing, deletedAt: Date.now(), updatedAt: Date.now(), version: existing.version + 1 }
  await db.tasks.put(updated)
  await db.syncQueue.add({
    taskId: id,
    operation: 'delete',
    payload: { id },
    timestamp: Date.now(),
    version: updated.version,
  })
}
