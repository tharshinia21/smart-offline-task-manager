import { useTasks } from '../hooks/useTasks'
import { getPriority } from '../priority/priorityEngine'

export default function Statistics(){
  const tasks=useTasks()
  const now=new Date()
  const all = tasks.filter(t=>!t.deletedAt)
  const total=all.length
  const completed=all.filter(t=>t.status==='completed')
  const completedCount=completed.length
  const overdue=tasks.filter(t=> !t.deletedAt && t.status!=='completed' && t.status!=='cancelled' && getPriority(t,now)==='overdue').length
  const rate = total? Math.round(completedCount/total*100):0
  const byPri: Record<string,number> = {}
  for(const t of tasks.filter(t=> !t.deletedAt && t.status!=='completed' && t.status!=='cancelled')){
    const p=getPriority(t,now); byPri[p]=(byPri[p]||0)+1
  }
  // Average completion time (from createdAt to completedAt)
  const avgMs = completedCount ? Math.round(completed.reduce((s,t)=> s + ((t.completedAt||t.updatedAt) - t.createdAt),0)/completedCount) : 0
  const avgHours = (avgMs/3600000).toFixed(1)
  const avgDays = (avgMs/86400000).toFixed(1)

  // Last 7 days trend
  const trend = Array.from({length:7}, (_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-6+i)
    const iso=d.toISOString().slice(0,10)
    const created = all.filter(t=> new Date(t.createdAt).toISOString().slice(0,10)===iso).length
    const done = completed.filter(t=> t.completedAt && new Date(t.completedAt).toISOString().slice(0,10)===iso).length
    return { label: d.toLocaleDateString(undefined,{weekday:'short'}), iso, created, done }
  })

  const statusCounts = {
    not_started: all.filter(t=>t.status==='not_started').length,
    in_progress: all.filter(t=>t.status==='in_progress').length,
    completed: completedCount,
    cancelled: all.filter(t=>t.status==='cancelled').length,
  }

  return (
    <div className="mx-auto max-w-6xl p-4">
      <h1 className="text-2xl font-bold">Statistics</h1>
      <p className="text-sm text-zinc-500">Offline stats computed locally from IndexedDB</p>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl border bg-white p-4 text-center"><div className="text-2xl font-bold">{total}</div><div className="text-sm text-zinc-500">Total</div></div>
        <div className="rounded-2xl border bg-white p-4 text-center"><div className="text-2xl font-bold text-green-600">{completedCount}</div><div className="text-sm text-zinc-500">Completed</div></div>
        <div className="rounded-2xl border bg-white p-4 text-center"><div className="text-2xl font-bold text-red-600">{overdue}</div><div className="text-sm text-zinc-500">Overdue</div></div>
        <div className="rounded-2xl border bg-white p-4 text-center"><div className="text-2xl font-bold">{rate}%</div><div className="text-sm text-zinc-500">Completion rate</div></div>
      </div>

      <div className="mt-4 grid md:grid-cols-3 gap-3">
        <div className="rounded-2xl border bg-white p-4">
          <h2 className="font-semibold text-sm">Avg completion time</h2>
          <p className="mt-2 text-2xl font-bold">{completedCount? `${avgDays} days` : '—'}</p>
          <p className="text-xs text-zinc-500">{completedCount? `${avgHours} hours avg • from created → completed` : 'Complete a task to see avg'}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <h2 className="font-semibold text-sm">Status breakdown</h2>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between"><span>⭕ Not Started</span><b>{statusCounts.not_started}</b></div>
            <div className="flex justify-between"><span>🔵 In Progress</span><b>{statusCounts.in_progress}</b></div>
            <div className="flex justify-between"><span>✅ Completed</span><b>{statusCounts.completed}</b></div>
            <div className="flex justify-between"><span>🚫 Cancelled</span><b>{statusCounts.cancelled}</b></div>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <h2 className="font-semibold text-sm">Priority distribution</h2>
          <div className="mt-2 space-y-1">
            {Object.entries(byPri).length===0? <p className="text-zinc-500 text-sm">No active tasks</p> : Object.entries(byPri).map(([k,v])=>(
              <div key={k} className="flex items-center justify-between text-sm">
                <span className="capitalize">{k.replace('_',' ')}</span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border bg-white p-4">
        <h2 className="font-semibold">7-day trends (created vs completed)</h2>
        <div className="mt-3 grid grid-cols-7 gap-2 text-center">
          {trend.map(d=>(
            <div key={d.iso} className="rounded-xl bg-zinc-50 border p-2">
              <div className="text-xs font-semibold">{d.label}</div>
              <div className="text-[10px] text-zinc-500">{d.iso.slice(5)}</div>
              <div className="mt-1 text-xs"><span className="text-indigo-600 font-bold">{d.created}</span> created</div>
              <div className="text-xs"><span className="text-green-600 font-bold">{d.done}</span> done</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
