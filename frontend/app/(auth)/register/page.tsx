"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveAuth } from '../../../lib/auth'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

function roleToPath(role) {
  if (!role) return '/login'
  const r = role.toUpperCase()
  if (r === 'OWNER' || r === 'ADMIN') return '/dashboard'
  if (r === 'BENDAHARA') return '/keuangan'
  if (r === 'MENTOR') return '/jadwal'
  return '/login'
}

export default function Page() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('MENTOR')
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Register failed')

      const loginRes = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const loginData = await loginRes.json()
      if (!loginRes.ok) throw new Error(loginData?.error || 'Login after register failed')

      saveAuth({ user: loginData.user, session: loginData.session })
      router.push(roleToPath(loginData.user.role))
    } catch (err) {
      setError(err.message || String(err))
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="OWNER">OWNER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="BENDAHARA">BENDAHARA</option>
            <option value="MENTOR">MENTOR</option>
          </select>
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">Register</button>
      </form>
    </div>
  )
}
