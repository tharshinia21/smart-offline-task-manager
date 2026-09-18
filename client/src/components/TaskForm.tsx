import { useState } from 'react'
import type { Task } from '../types/task'

type Props = {
  initial?: Partial<Task>
  onSubmit: (data: { title: string; dueDate: string; dueTime: string; link?: string }) => void
  submitLabel: string
}

export function TaskForm({ initial, onSubmit, submitLabel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? new Date().toISOString().slice(0, 10))
  const [dueTime, setDueTime] = useState(initial?.dueTime ?? '18:00')
  const [link, setLink] = useState(initial?.link ?? '')
  const [err, setErr] = useState('')

  const handle = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return setErr('Title is required')
    if (!dueDate) return setErr('Due date required')
    if (!dueTime) return setErr('Due time required')
    if (link && !/^https?:\/\/.+/.test(link)) return setErr('Link must start with http:// or https://')
    setErr('')
    onSubmit({ title: title.trim(), dueDate, dueTime, link: link.trim() || undefined })
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Task title *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Complete CN Assignment" className="mt-1 w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Due date *</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2.5" />
        </div>
        <div>
          <label className="text-sm font-medium">Due time *</label>
          <input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2.5" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Optional link</label>
        <input value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
        <p className="mt-1 text-xs text-zinc-500">Assignment portal, Drive, GitHub, etc.</p>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button type="submit" className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700">{submitLabel}</button>
    </form>
  )
}
