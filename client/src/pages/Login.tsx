import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { register, login } from '../sync/auth'

export default function Login(){
  const nav=useNavigate()
  const [mode, setMode]=useState<'login'|'register'>('login')
  const [name,setName]=useState(localStorage.getItem('user_name')||'')
  const [email,setEmail]=useState(localStorage.getItem('user_email')||'')
  const [password,setPassword]=useState('')
  const [err,setErr]=useState('')
  const [loading,setLoading]=useState(false)

  const submit = async (e: React.FormEvent)=>{
    e.preventDefault()
    setErr('')
    setLoading(true)
    try{
      if(mode==='register'){
        if(!name.trim()) throw new Error('Name required')
        await register(name.trim(), email.trim(), password)
      } else {
        await login(email.trim(), password)
      }
      nav('/dashboard')
    } catch(ex:any){
      // offline fallback: allow local mode if server unreachable
      if(ex.message?.includes('Failed to fetch') || ex.message?.includes('fetch')){
        localStorage.setItem('user_name', name||email||'User')
        localStorage.setItem('user_email', email)
        alert('Server offline — continuing in local offline mode (IndexedDB). Tasks will sync to MongoDB when back online.')
        nav('/dashboard')
      } else {
        setErr(ex.message||'Failed')
      }
    } finally{ setLoading(false)}
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-3xl font-bold">Welcome</h1>
      <p className="text-zinc-500 text-sm">Smart Tasks — MongoDB cloud sync • Offline-first</p>
      <div className="mt-4 flex rounded-full border bg-zinc-100 p-1 text-sm">
        <button onClick={()=>setMode('login')} className={`flex-1 rounded-full py-1.5 ${mode==='login'?'bg-white shadow':''}`}>Login</button>
        <button onClick={()=>setMode('register')} className={`flex-1 rounded-full py-1.5 ${mode==='register'?'bg-white shadow':''}`}>Register</button>
      </div>
      <form onSubmit={submit} className="mt-4 space-y-3">
        {mode==='register' && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" className="w-full rounded-xl border px-3 py-3"/>}
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" required className="w-full rounded-xl border px-3 py-3"/>
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (min 6)" type="password" required className="w-full rounded-xl border px-3 py-3"/>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button disabled={loading} className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white disabled:opacity-50">{loading?'Please wait…': mode==='register'?'Create account →':'Login →'}</button>
      </form>
      <button onClick={()=>{ localStorage.setItem('user_name', name||'Guest'); nav('/dashboard')}} className="mt-3 w-full rounded-xl border py-2 text-sm">Skip — use offline local mode</button>
      <p className="mt-3 text-xs text-zinc-500 text-center">Backend: NestJS + MongoDB (Mongoose) • JWT + Argon2 • Sync via /api/sync • IndexedDB offline queue</p>
    </div>
  )
}
