// frontend/app/(auth)/login/page.tsx
"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '../../../components/Input'
import Button from '../../../components/Button'
// IMPORT CONTEXT
import { useUser } from '@/context/UserContext'; 

// HAPUS import { saveAuth } from '../../../lib/auth' karena sudah ditangani Context

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

function roleToPath(role: string) {
  if (!role) return '/login'
  const r = role.toUpperCase()
  if (r === 'OWNER' || r === 'ADMIN') return '/dashboard'
  if (r === 'BENDAHARA') return '/keuangan'
  if (r === 'MENTOR') return '/jadwal'
  return '/login'
}

export default function Page() {
  const router = useRouter()
  // AMBIL FUNGSI LOGIN DARI CONTEXT
  const { login } = useUser(); 

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data?.error || 'Login failed')

      // KRITIS: Gunakan fungsi login dari Context, BUKAN saveAuth manual
      // Ini akan menyimpan token DAN mengupdate state aplikasi secara instan
      login({ user: data.user, session: data.session });

      // Redirect sesuai role
      router.push(roleToPath(data.user.role))
      
    } catch (err: any) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 py-8" style={{ background: 'linear-gradient(180deg, #0077AF 0%, #003249 100%)' }}>
      <div className="auth-card">
        <h1 className="auth-heading">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white font-medium mb-2 text-sm">Username or Email</label>
            <div className="mt-2">
              <Input
                ariaLabel="username or email"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                placeholder="Username or email"
              />
            </div>
          </div>

          <div>
            <label className="text-white font-medium mb-2 text-sm">Password</label>
            <div className="mt-2">
              <Input
                ariaLabel="password"
                type="password"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
          </div>

          {error && <div className="text-red-300 text-sm text-center bg-red-900/20 p-2 rounded">{error}</div>}

          <div className="flex justify-center mt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Login'}
            </Button>
          </div>

          <div className="text-center mt-3 small-muted">
            <span>Belum punya Akun ? </span>
            <a href="/register" style={{ color: '#3DA9FB' }} className="hover:underline">Daftar Disini</a>
          </div>
        </form>
      </div>
    </div>
  )
} 