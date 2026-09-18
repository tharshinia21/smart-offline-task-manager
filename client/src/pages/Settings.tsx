import { useState, useEffect } from 'react'
import { db } from '../db/database'
import { requestPermission, nextAllowedTime } from '../notifications/notificationManager'
import { getPendingSyncCount, fullSync, isOnline } from '../sync/syncEngine'
import { getUser, logout } from '../sync/auth'

export default function Settings(){
  const [notif, setNotif]=useState(typeof Notification!=='undefined'? Notification.permission: 'unknown')
  const [pending, setPending]=useState(0)
  const [syncing,setSyncing]=useState(false)
  const [user,setUser]=useState(getUser())
  const [deviceId]=useState(()=> localStorage.getItem('deviceId') || (()=>{const id=crypto.randomUUID(); localStorage.setItem('deviceId', id); return id})())

  useEffect(()=>{ getPendingSyncCount().then(setPending); const id=setInterval(()=>getPendingSyncCount().then(setPending),2000); return ()=>clearInterval(id)},[])

  const enableNotif=async()=>{
    const p=await requestPermission()
    setNotif(p)
  }

  const doSync=async()=>{
    setSyncing(true)
    const r=await fullSync()
    setSyncing(false)
    alert(`Pushed ${r.pushed}, pulled ${r.pulled}${r.conflicts.length?`, ${r.conflicts.length} conflicts (server-wins)`:''}`)
  }

  const clearData=async()=>{
    if(!confirm('Clear all local tasks? This cannot be undone.')) return
    await db.tasks.clear()
    await db.syncQueue.clear()
    localStorage.removeItem('lastSyncAt')
    alert('Cleared local IndexedDB')
  }

  return (
    <div className="mx-auto max-w-xl p-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="mt-4 space-y-4">
        <section className="rounded-2xl border bg-white p-4">
          <h2 className="font-semibold">Account</h2>
          {user? <>
            <p className="text-sm text-zinc-600">{user.name} • {user.email}</p>
            <button onClick={()=>{logout(); setUser(null); alert('Logged out — offline mode')}} className="mt-2 rounded-xl border px-4 py-2 text-sm">Logout</button>
          </> : <>
            <p className="text-sm text-zinc-500">Not logged in — offline local mode. Login to sync with MongoDB cloud.</p>
            <a href="/login" className="mt-2 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Go to Login</a>
          </>}
          <p className="mt-2 text-xs text-zinc-500">Backend: NestJS + MongoDB (Mongoose) • JWT • Argon2</p>
        </section>

        <section className="rounded-2xl border bg-white p-4">
          <h2 className="font-semibold">Notifications</h2>
          <p className="text-sm text-zinc-500">Permission: {notif}</p>
          <button onClick={enableNotif} className="mt-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Enable Notifications</button>
          <p className="mt-2 text-xs text-zinc-500">Reminders respect quiet hours 11PM-7AM. Priority: Low=none, Medium/High=daily 9AM, Very High/Critical=every 4h (7,11,15,19), Overdue=daily.</p>
        </section>

        <section className="rounded-2xl border bg-white p-4">
          <h2 className="font-semibold">Quiet Hours</h2>
          <p className="text-sm text-zinc-500">Fixed: 11:00 PM → 7:00 AM (suppressed, resumes at 7AM). Next allowed: {nextAllowedTime(new Date()).toLocaleString()}</p>
        </section>

        <section className="rounded-2xl border bg-white p-4">
          <h2 className="font-semibold">Priority Rules</h2>
          <ul className="text-sm text-zinc-600 list-disc pl-5">
            <li>15+ days Low (green)</li>
            <li>7–14 Medium (yellow)</li>
            <li>3–6 High (orange)</li>
            <li>1–2 Very High (red)</li>
            <li>Due today Critical (strong red)</li>
            <li>Past deadline Overdue</li>
          </ul>
        </section>

        <section className="rounded-2xl border bg-white p-4">
          <h2 className="font-semibold">Connected Devices</h2>
          <p className="text-sm text-zinc-500">Device ID: <span className="font-mono text-xs">{deviceId.slice(0,8)}…</span></p>
          <p className="text-xs text-zinc-500">Stored in MongoDB `devices` collection when push subscription exists. This device syncs via IndexedDB → MongoDB.</p>
          <p className="mt-1 text-xs text-zinc-500">Online: {isOnline()?'yes':'no'} • Pending: {pending}</p>
        </section>

        <section className="rounded-2xl border bg-white p-4">
          <h2 className="font-semibold">Synchronization (MongoDB)</h2>
          <p className="text-sm text-zinc-500">Offline-first via IndexedDB (Dexie). Changes queued locally, synced to MongoDB when online via <span className="font-mono">/api/sync/push</span> & <span className="font-mono">/api/sync/pull</span>.</p>
          <p className="text-xs text-zinc-500 mt-1">Conflict detection: version numbers + updatedAt. Server-wins on conflict, local auto-merged. Stable clientId preserved.</p>
          <div className="mt-2 flex gap-2">
            <button onClick={doSync} disabled={syncing} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{syncing?'Syncing…':'Sync now'}</button>
            <span className="text-xs self-center text-zinc-500">{pending} queued • Last sync: {localStorage.getItem('lastSyncAt')? new Date(Number(localStorage.getItem('lastSyncAt'))).toLocaleString():'never'}</span>
          </div>
          <button onClick={clearData} className="mt-3 rounded-xl border px-4 py-2 text-sm">Clear local data</button>
        </section>

        <section className="rounded-2xl border bg-white p-4">
          <h2 className="font-semibold">Appearance</h2>
          <p className="text-sm text-zinc-500">Light theme MVP. PWA install via browser menu → Install / Add to Home Screen.</p>
          <p className="text-xs text-zinc-500">MongoDB does not affect UI theme.</p>
        </section>
      </div>
    </div>
  )
}
