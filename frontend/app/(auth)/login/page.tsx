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
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Login failed')

      saveAuth({ user: data.user, session: data.session })
      router.push(roleToPath(data.user.role))
    } catch (err) {
      setError(err.message || String(err))
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">Login</button>
      </form>
    </div>
  )
}
