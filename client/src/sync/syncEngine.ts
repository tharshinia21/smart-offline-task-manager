import { db } from '../db/database'
import type { Task } from '../types/task'

const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api'

function getToken(): string | null {
  return localStorage.getItem('access_token')
}

export async function getPendingSyncCount(): Promise<number> {
  return db.syncQueue.count()
}

export async function clearSyncQueue() {
  await db.syncQueue.clear()
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

function authHeaders(): Record<string,string> {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

// Push local changes to MongoDB server
export async function pushChanges(): Promise<{ pushed: number; conflicts: any[] }> {
  if (!isOnline() || !getToken()) return { pushed: 0, conflicts: [] }
  const queue = await db.syncQueue.toArray()
  if (queue.length === 0) return { pushed: 0, conflicts: [] }
  try {
    const res = await fetch(`${API}/sync/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ changes: queue }),
    })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`push failed ${res.status}: ${txt}`)
    }
    const data = await res.json()
    // clear only successfully pushed (non-conflict handled separately)
    const conflicts = (data.results || []).filter((r:any)=> r.status==='conflict')
    // clear queue for now; conflicts kept for UI
    await db.syncQueue.clear()
    if (conflicts.length) {
      // apply server wins for conflicts locally
      for (const c of conflicts) {
        if (c.server) {
          const s = c.server
          // map server _id/clientId to local id
          const localId = s.clientId || s._id
          const payload: Task = {
            id: localId,
            title: s.title,
            dueDate: s.dueDate,
            dueTime: s.dueTime,
            link: s.link,
            linkName: s.linkName,
            status: s.status,
            createdAt: new Date(s.createdAt).getTime(),
            updatedAt: new Date(s.updatedAt).getTime(),
            completedAt: s.completedAt,
            version: s.version,
            deletedAt: s.deletedAt,
            snoozedUntil: s.snoozedUntil,
          }
          await db.tasks.put(payload)
        }
      }
    }
    return { pushed: queue.length, conflicts }
  } catch (e) {
    console.warn('[sync push] failed', e)
    return { pushed: 0, conflicts: [] }
  }
}

// Pull server changes since lastSyncAt
export async function pullChanges(): Promise<number> {
  if (!isOnline() || !getToken()) return 0
  const since = Number(localStorage.getItem('lastSyncAt') || 0)
  try {
    const res = await fetch(`${API}/sync/pull?since=${since}`, { headers: authHeaders() })
    if (!res.ok) throw new Error(`pull ${res.status}`)
    const data = await res.json()
    let applied = 0
    for (const s of data.tasks || []) {
      const task: Task = {
        id: s.clientId || s._id,
        title: s.title,
        dueDate: s.dueDate,
        dueTime: s.dueTime,
        link: s.link,
        linkName: s.linkName,
        status: s.status,
        createdAt: new Date(s.createdAt).getTime(),
        updatedAt: new Date(s.updatedAt).getTime(),
        completedAt: s.completedAt,
        version: s.version,
        deletedAt: s.deletedAt,
        snoozedUntil: s.snoozedUntil,
      }
      // last-write-wins by version/timestamp
      const local = await db.tasks.get(task.id)
      if (!local || task.version >= local.version || task.updatedAt > local.updatedAt) {
        await db.tasks.put(task)
        applied++
      }
    }
    localStorage.setItem('lastSyncAt', String(data.serverTime || Date.now()))
    return applied
  } catch (e) {
    console.warn('[sync pull] failed', e)
    return 0
  }
}

export async function fullSync(): Promise<{ pushed: number; pulled: number; conflicts: any[] }> {
  const { pushed, conflicts } = await pushChanges()
  const pulled = await pullChanges()
  return { pushed, pulled, conflicts }
}

// Conflict helper exported for UI
export async function detectConflict(local: Task, serverVersion: number) {
  return local.version < serverVersion
}
