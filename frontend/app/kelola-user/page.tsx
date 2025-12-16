"use client"
import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { UserPlus, Save, Loader2, ShieldAlert } from 'lucide-react'
import { getUserRole } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function KelolaUserPage() {
    const [role, setRole] = useState<string | null>(null)
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null)

    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        phone_number: '',
        birthday: '', // Format YYYY-MM-DD
        role: 'MENTOR' // Default
    })

    useEffect(() => {
        const userRole = getUserRole()
        setRole(userRole)
        // Jika bukan OWNER/ADMIN, tendang keluar
        if (userRole !== 'OWNER' && userRole !== 'ADMIN') {
            router.push('/dashboard')
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            // Gunakan endpoint register-internal yang sudah kita buat di backend
            const res = await fetch('http://localhost:4000/api/auth/register-internal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
                // credentials: 'include' // Aktifkan jika backend butuh cookie session owner
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Gagal membuat user')
            }

            setMessage({ type: 'success', text: `Berhasil membuat user: ${form.username} (${form.role})` })
            // Reset form
            setForm({ username: '', email: '', password: '', phone_number: '', birthday: '', role: 'MENTOR' })
            
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setLoading(false)
        }
    }

    // Input Helper
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    if (role !== 'OWNER' && role !== 'ADMIN') return null // Prevent flash

    return (
        <DashboardLayout title="Kelola Pengguna">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                    <div className="bg-blue-100 p-2 rounded-lg text-[#0077AF]">
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Tambah Akun Baru</h2>
                        <p className="text-sm text-gray-500">Buat akun untuk Mentor, Bendahara, atau Admin.</p>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 mb-6 rounded-lg text-sm font-medium flex items-center gap-2 ${
                        message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {message.type === 'error' && <ShieldAlert size={18}/>}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Peran (Role)</label>
                        <select 
                            name="role" 
                            value={form.role} 
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077AF] outline-none"
                        >
                            <option value="MENTOR">MENTOR (Guru)</option>
                            <option value="BENDAHARA">BENDAHARA (Keuangan)</option>
                            <option value="ADMIN">ADMIN (Operasional)</option>
                            {/* Hanya Owner yang bisa bikin Owner lain, opsional */}
                            {role === 'OWNER' && <option value="OWNER">OWNER</option>}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Nama Lengkap</label>
                            <input 
                                type="text" name="username" required value={form.username} onChange={handleChange}
                                className="w-full p-2 border rounded-lg" placeholder="Nama User"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                            <input 
                                type="email" name="email" required value={form.email} onChange={handleChange}
                                className="w-full p-2 border rounded-lg" placeholder="email@contoh.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">No HP</label>
                            <input 
                                type="text" name="phone_number" required value={form.phone_number} onChange={handleChange}
                                className="w-full p-2 border rounded-lg" placeholder="08..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Tanggal Lahir</label>
                            <input 
                                type="date" name="birthday" required value={form.birthday} onChange={handleChange}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Password Awal</label>
                        <input 
                            type="text" name="password" required value={form.password} onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg font-mono" 
                            placeholder="Buat password sementara..."
                        />
                        <p className="text-xs text-gray-500 mt-1">*Berikan password ini kepada pengguna. Mereka dapat menggantinya nanti.</p>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 bg-[#0077AF] hover:bg-[#006699] text-white font-bold rounded-lg shadow-md transition-all flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        Buat Akun
                    </button>
                </form>
            </div>
        </DashboardLayout>
    )
}