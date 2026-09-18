import { useState, useMemo } from 'react'
import { useTasks } from '../hooks/useTasks'
import { TaskCard } from '../components/TaskCard'
import { Link } from 'react-router-dom'

function monthDays(year: number, month: number) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startPad = first.getDay() // 0 Sun
  const days: (string | null)[] = []
  for (let i = 0; i < startPad; i++) days.push(null)
  for (let d = 1; d <= last.getDate(); d++) {
    const iso = new Date(year, month, d).toISOString().slice(0, 10)
    days.push(iso)
  }
  return days
}

export default function Calendar(){
  const tasks=useTasks()
  const now = new Date()
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const [selected, setSelected]=useState<string>(now.toISOString().slice(0,10))
  const days = useMemo(()=> monthDays(ym.y, ym.m), [ym])
  const byDate = useMemo(()=>{
    const map = new Map<string, number>()
    for (const t of tasks) if(!t.deletedAt) map.set(t.dueDate, (map.get(t.dueDate)||0)+1)
    return map
  }, [tasks])
  const filtered=tasks.filter(t=> t.dueDate===selected && !t.deletedAt)
  const monthName = new Date(ym.y, ym.m, 1).toLocaleDateString(undefined, { month:'long', year:'numeric' })

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex gap-2">
          <button onClick={()=>setYm(({y,m})=> m===0?{y:y-1,m:11}:{y,m:m-1})} className="rounded-full border bg-white px-3 py-1.5 text-sm">‹ Prev</button>
          <button onClick={()=>{const n=new Date(); setYm({y:n.getFullYear(),m:n.getMonth()}); setSelected(n.toISOString().slice(0,10))}} className="rounded-full border bg-white px-3 py-1.5 text-sm">Today</button>
          <button onClick={()=>setYm(({y,m})=> m===11?{y:y+1,m:0}:{y,m:m+1})} className="rounded-full border bg-white px-3 py-1.5 text-sm">Next ›</button>
        </div>
      </div>
      <p className="mt-1 text-sm text-zinc-500">{monthName} • Select a date to view tasks • Tap date to filter</p>

      <div className="mt-4 rounded-2xl border bg-white p-3">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-zinc-500 mb-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=> <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i)=>{
            if(d===null) return <div key={`e-${i}`} className="h-16 rounded-xl" />
            const date = new Date(d+'T12:00:00')
            const count = byDate.get(d)||0
            const isToday = d===now.toISOString().slice(0,10)
            const isSelected = d===selected
            return (
              <button key={d} onClick={()=>setSelected(d)} className={`h-16 rounded-xl border p-1 text-left flex flex-col justify-between ${isSelected?'bg-zinc-900 text-white border-zinc-900': isToday?'bg-indigo-50 border-indigo-200':'bg-zinc-50 hover:bg-white'}`}>
                <span className={`text-sm font-bold ${isSelected?'text-white':''}`}>{date.getDate()}</span>
                {count>0 && <span className={`text-[10px] rounded-full px-1.5 py-0.5 self-start ${isSelected?'bg-white text-zinc-900':'bg-indigo-600 text-white'}`}>{count} task{count>1?'s':''}</span>}
              </button>
            )
          })}
        </div>
      </div>

      <h2 className="mt-4 font-semibold flex items-center gap-2">{selected} — {filtered.length} task{filtered.length!==1?'s':''} {filtered.length>0 && <Link to={`/tasks/new`} className="ml-auto text-xs text-indigo-600 underline">+ Add Task</Link>}</h2>
      <div className="mt-3 grid gap-3">
        {filtered.length===0? <div className="rounded-2xl border bg-white p-8 text-center text-zinc-500">No tasks on this date — <Link to="/tasks/new" className="text-indigo-600 underline">create one</Link></div> : filtered.map(t=> <TaskCard key={t.id} task={t}/>)}
      </div>
    </div>
  )
}
