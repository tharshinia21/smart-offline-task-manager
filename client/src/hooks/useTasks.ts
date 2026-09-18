import { useEffect, useState } from 'react'
import { db } from '../db/database'
import type { Task } from '../types/task'
import { liveQuery } from 'dexie'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  useEffect(() => {
    const obs = liveQuery(() => db.tasks.filter(t => !t.deletedAt).toArray())
    const sub = obs.subscribe({ next: setTasks, error: console.error })
    return () => sub.unsubscribe()
  }, [])
  return tasks
}

export function useTask(id?: string) {
  const [task, setTask] = useState<Task | undefined>(undefined)
  useEffect(() => {
    if (!id) return
    const obs = liveQuery(() => db.tasks.get(id))
    const sub = obs.subscribe({ next: setTask })
    return () => sub.unsubscribe()
  }, [id])
  return task
}
