"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '../../../components/Input'
import Button from '../../../components/Button'
import { useUser } from '@/context/UserContext'
import { useLoading } from '@/context/LoadingContext' // ✅ 1. Import Global Loading

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
  const { login } = useUser()
  const { withLoading } = useLoading() // ✅ 2. Gunakan Hook Loading

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  // ❌ State loading lokal dihapus karena sudah pakai global
  // const [loading, setLoading] = useState(false) 

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // ✅ 3. Bungkus proses dengan withLoading
    // Layar akan otomatis blur dan animasi loading muncul
    await withLoading(async () => {
      try {
        const res = await fetch(`${API}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        
        if (!res.ok) throw new Error(data?.error || 'Login failed')

        // Simpan sesi user ke context
        login({ user: data.user, session: data.session })

        // Redirect ke halaman sesuai role
        // Loading screen akan tetap muncul sebentar sampai halaman berpindah
        router.push(roleToPath(data.user.role))
        
      } catch (err: any) {
        // Jika error, loading otomatis mati (handled by context), lalu kita set pesan error
        setError(err.message || String(err))
      }
    })
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 py-8" style={{ background: 'linear-gradient(180deg, #0077AF 0%, #003249 100%)' }}>
      <div className="auth-card shadow-2xl transition-all duration-300"> 
        <h1 className="auth-heading">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white font-medium mb-2 text-sm">Username or Email</label>
            <div className="mt-2">
              <Input
                aria-label="username or email"
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
                aria-label="password"
                type="password"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-200 text-sm text-center bg-red-900/50 border border-red-500/50 p-2 rounded animate-pulse">
              ⚠️ {error}
            </div>
          )}

          <div className="flex justify-center mt-6">
            <Button type="submit">
               {/* Teks tombol statis saja, karena loading screen akan menutupi seluruh layar */}
               Masuk
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}