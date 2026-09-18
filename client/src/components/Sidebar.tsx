import { NavLink } from 'react-router-dom'

const items = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tasks', label: 'All Tasks' },
  { to: '/tasks/today', label: 'Today' },
  { to: '/tasks/upcoming', label: 'Upcoming' },
  { to: '/tasks/overdue', label: 'Overdue' },
  { to: '/tasks/completed', label: 'Completed' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/focus', label: 'Focus Mode' },
  { to: '/statistics', label: 'Statistics' },
  { to: '/settings', label: 'Settings' },
]

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r bg-white p-4 md:block">
      <nav className="flex flex-col gap-1">
        {items.map(i => (
          <NavLink key={i.to} to={i.to} className={({ isActive }) => `rounded-xl px-3 py-2 text-sm ${isActive ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-100 text-zinc-700'}`}>{i.label}</NavLink>
        ))}
      </nav>
      <div className="mt-6 rounded-xl bg-indigo-50 p-3 text-xs text-indigo-700">
        <p className="font-semibold">Offline Ready</p>
        <p>Works without internet. Tasks auto-sync when back online.</p>
      </div>
    </aside>
  )
}
