import { useState } from 'react'
import { updateTask } from '../db/database'

const snoozeOptions = [5, 10, 15, 30, 60] as const

export function ReminderBottomSheet({ task }: { task: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSnooze, setSelectedSnooze] = useState<number | null>(null)
  const [snoozeMinutes, setSnoozeMinutes] = useState(10)
  const [rescheduleDate, setRescheduleDate] = useState<string>(task.dueDate)
  const [rescheduleTime, setRescheduleTime] = useState<string>(task.dueTime)
  const taskId = task.id

  const handleDone = async () => {
    setIsOpen(false)
    await updateTask(taskId, { status: 'completed', completedAt: Date.now() })
  }

  const handleSnooze = async (mins: number) => {
    setIsOpen(false)
    const until = Date.now() + mins * 60000
    await updateTask(taskId, { snoozedUntil: until })
    setSelectedSnooze(mins)
    setSnoozeMinutes(mins)
    alert(`Snoozed for ${mins} minutes`)
  }

  const handleReschedule = async () => {
    setIsOpen(false)
    await updateTask(taskId, { dueDate: rescheduleDate, dueTime: rescheduleTime })
    alert(`Rescheduled to ${rescheduleDate} at ${rescheduleTime}`)
  }

  const handleDismiss = () => {
    setIsOpen(false)
  }

  if (!isOpen) return null

  const meta = { bg: 'bg-zinc-50', text: 'text-zinc-700', dot: '🟡' }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Task reminder"
      className="fixed bottom-0 left-0 right-0 transition-all transform duration-300 ease-out md:translate-y-full md:translate-y-0"
      style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)' }}
    >
      <div className="max-w-full bg-white border-t-0 rounded-t-2xl shadow-2xl transform origin-bottom max-h-[80%] w-full overflow-y-auto">
        <div className="flex items-start justify-between p-4 border-b border-zinc-200">
          <h2 className="text-xl font-bold text-zinc-900">
            🔔 {task.title}
          </h2>
          <button
            onClick={handleDismiss}
            className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-sm text-zinc-500">
            Due{" "}
            <span className={`font-medium ${meta.bg} ${meta.text}`}>
              {task.dueDate} at {task.dueTime}
            </span>
          </p>

          {selectedSnooze !== null ? (
            <div className="bg-zinc-50 rounded border p-3">
              <p className="text-xs text-zinc-500">Snoozed {selectedSnooze} min</p>
              <button
                onClick={()=>handleSnooze(selectedSnooze!)}
                className="w-full rounded bg-indigo-600 py-2 text-sm font-semibold text-white mt-1"
              >
                Confirm Snooze
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {snoozeOptions.map((mins) => (
                  <button
                    key={mins}
                    onClick={()=>handleSnooze(mins)}
                    className={`rounded bg-zinc-100 py-2 text-xs font-medium text-zinc-700 hover:bg-indigo-50 transition-colors ${snoozeMinutes===mins?'bg-indigo-50 text-indigo-700':'text-zinc-700'}`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              <input
                type="number"
                min={1}
                max={1440}
                value={snoozeMinutes}
                onChange={e=>setSnoozeMinutes(Number(e.target.value))}
                className="mt-2 rounded border w-full py-1 text-sm"
                placeholder="Custom minutes"
              />

              <div>
                <p className="text-xs text-zinc-500">Reschedule to</p>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={e=>setRescheduleDate(e.target.value)}
                  className="mt-1 rounded border w-full py-1 text-sm"
                />
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={e=>setRescheduleTime(e.target.value)}
                  className="mt-1 rounded border w-full py-1 text-sm"
                />
              </div>

              <div className="mt-3">
                <button
                  onClick={handleReschedule}
                  className="w-full rounded bg-indigo-600 py-2 text-sm font-semibold text-white"
                >
                  Reschedule
                </button>
              </div>
            </>
          )}

          <div className="mt-4 pt-4 border-t border-zinc-200">
            <button onClick={handleDone} className="w-full rounded bg-green-600 py-2 text-sm font-semibold text-white">
              ✓ Done
            </button>
            <button onClick={handleDismiss} className="w-full rounded bg-white py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 mt-2">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}