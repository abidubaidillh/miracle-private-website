"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '../../../components/Input'
import Button from '../../../components/Button'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// Icon components (inline SVG for simplicity)
const UserIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
  </svg>
)

const EmailIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </svg>
)

const PhoneIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.547.773c-.693.348-.335 1.47.616 2.428.951.957 2.08 1.309 2.428.616l.773-1.547a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2.57c-6.552 0-11.43-4.878-11.43-11.43V3z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v2H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v2H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
)

const LockIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  </svg>
)

const EyeIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
  </svg>
)

export default function Page() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [birthday, setBirthday] = useState('')
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, phone_number: phoneNumber, birthday, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Register failed')

      // After successful registration, redirect to login (do not auto-login)
      router.push('/login')
    } catch (err) {
      setError(err.message || String(err))
    }
  }

  const inputClass = ''

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 py-8" style={{ background: 'linear-gradient(135deg, #0077AF 0%, #003249 100%)' }}>
      <div className="rounded-3xl shadow-2xl max-w-md w-full p-10" style={{ background: 'linear-gradient(180deg, rgba(100, 160, 200, 0.15), rgba(50, 100, 140, 0.1))', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <h1 className="text-white text-3xl font-bold mb-8 text-center">Sign Up</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div>
            <label className="block text-white font-medium mb-2 text-sm">Username</label>
            <Input
              ariaLabel="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              leftIcon={<UserIcon />}
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-white font-medium mb-2 text-sm">Email</label>
            <Input
              ariaLabel="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              leftIcon={<EmailIcon />}
            />
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="block text-white font-medium mb-2 text-sm">Number Phone</label>
            <Input
              ariaLabel="phone number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Number Phone"
              leftIcon={<PhoneIcon />}
            />
          </div>

          {/* Birthday Field */}
          <div>
            <label className="block text-white font-medium mb-2 text-sm">Birthday</label>
            <Input
              ariaLabel="birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              leftIcon={<CalendarIcon />}
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-white font-medium mb-2 text-sm">Password</label>
            <Input
              ariaLabel="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              leftIcon={<LockIcon />}
              rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="toggle password visibility"><EyeIcon /></button>}
            />
          </div>

          {/* Error Message */}
          {error && <div className="bg-red-500/30 border border-red-400/50 text-red-100 px-4 py-2 rounded-lg text-sm">{error}</div>}

          {/* Sign Up Button */}
          <div className="flex justify-center mt-6">
            <Button type="submit">Sign Up</Button>
          </div>

          {/* Secondary Action */}
          <div className="text-center mt-6 text-sm">
            <span className="text-white/90">Abis Daftar Gas Login ! </span>
            <a href="/login" style={{ color: '#3DA9FB' }} className="hover:underline font-medium">
              Disini
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
