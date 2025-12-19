"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { UserPlus, Save, ShieldAlert } from 'lucide-react'
import { getUserRole } from '@/lib/auth' // Helper asli proyek Anda
import { useRouter } from 'next/navigation'
import { useLoading } from '@/context/LoadingContext'
import { registerInternalUser } from '@/lib/userActions'

export default function KelolaUserPage() {
    const router = useRouter()
    const { withLoading } = useLoading()
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
    const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null)

    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        phone_number: '',
        birthday: '',
        role: 'MENTOR',
        subjects: '', 
        salary_per_session: '' 
    })

    useEffect(() => {
        const role = getUserRole()
        setCurrentUserRole(role)
        // Proteksi Halaman
        if (role && role !== 'OWNER' && role !== 'ADMIN') {
            router.push('/dashboard')
        }
    }, [router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)

        await withLoading(async () => {
            try {
                // Eksekusi action
                await registerInternalUser(form)

                setMessage({ 
                    type: 'success', 
                    text: `Akun ${form.username} sebagai ${form.role} berhasil dibuat!` 
                })
                
                // Reset form setelah sukses
                setForm({ 
                    username: '', email: '', password: '', phone_number: '', birthday: '', 
                    role: 'MENTOR', subjects: '', salary_per_session: '' 
                })
                
            } catch (error: any) {
                console.error("Submit Error:", error.message)
                setMessage({ type: 'error', text: error.message })
            }
        })
    }

    // Jika belum ada role (loading), jangan tampilkan apa-apa dulu
    if (!currentUserRole) return null

    const isOwner = currentUserRole === 'OWNER'

    return (
        <DashboardLayout title="Kelola Pengguna">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                    <div className="bg-blue-100 p-2 rounded-lg text-[#0077AF]">
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Tambah Akun Baru</h2>
                        <p className="text-sm text-gray-500">Daftarkan Mentor atau Staff baru ke sistem.</p>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 mb-6 rounded-lg text-sm font-medium flex items-center gap-2 ${
                        message.type === 'success' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {message.type === 'error' && <ShieldAlert size={18}/>}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Peran (Role)</label>
                        <select 
                            name="role" 
                            value={form.role} 
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077AF] outline-none transition-all"
                        >
                            <option value="MENTOR">Mentor</option>
                            <option value="BENDAHARA">Bendahara</option>
                            <option value="ADMIN">Admin</option>
                            {isOwner && <option value="OWNER">Owner</option>}
                        </select>
                    </div>

                    {form.role === 'MENTOR' && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                            <div className="md:col-span-2">
                                <h3 className="text-sm font-bold text-[#0077AF] mb-2">Detail Penggajian Mentor</h3>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Mata Pelajaran</label>
                                <input type="text" name="subjects" value={form.subjects} onChange={handleChange} className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0077AF]" placeholder="Contoh: Matematika" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Gaji Per Sesi (Rp)</label>
                                <input type="number" name="salary_per_session" value={form.salary_per_session} onChange={handleChange} className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0077AF]" placeholder="50000" />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Nama Lengkap</label>
                            <input type="text" name="username" required value={form.username} onChange={handleChange} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#0077AF]" placeholder="Nama Lengkap" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                            <input type="email" name="email" required value={form.email} onChange={handleChange} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#0077AF]" placeholder="email@contoh.com" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">No HP</label>
                            <input type="text" name="phone_number" required value={form.phone_number} onChange={handleChange} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#0077AF]" placeholder="08..." />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Tanggal Lahir</label>
                            <input type="date" name="birthday" required value={form.birthday} onChange={handleChange} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#0077AF]" />
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Password Awal</label>
                        <input type="text" name="password" required value={form.password} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg font-mono outline-none focus:ring-2 focus:ring-[#0077AF]" placeholder="Password123" />
                        <p className="text-[10px] text-orange-600 mt-1">*Berikan password ini kepada pengguna untuk login pertama kali.</p>
                    </div>

                    <button type="submit" className="w-full py-3 bg-[#0077AF] hover:bg-[#006699] text-white font-bold rounded-lg shadow-md transition-all flex justify-center items-center gap-2">
                        <Save size={20} /> Daftarkan Pengguna
                    </button>
                </form>
            </div>
        </DashboardLayout>
    )
}