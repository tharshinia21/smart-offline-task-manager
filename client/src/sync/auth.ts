const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api'

export async function register(name: string, email: string, password: string) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  if (!res.ok) throw new Error((await res.text()) || 'register failed')
  const data = await res.json()
  localStorage.setItem('access_token', data.access_token)
  localStorage.setItem('user_name', data.user.name)
  localStorage.setItem('user_email', data.user.email)
  return data
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error((await res.text()) || 'login failed')
  const data = await res.json()
  localStorage.setItem('access_token', data.access_token)
  localStorage.setItem('user_name', data.user.name)
  localStorage.setItem('user_email', data.user.email)
  return data
}

export function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('user_name')
  localStorage.removeItem('user_email')
}

export function getUser() {
  const t = localStorage.getItem('access_token')
  if (!t) return null
  return { name: localStorage.getItem('user_name') || 'User', email: localStorage.getItem('user_email') || '' }
}
