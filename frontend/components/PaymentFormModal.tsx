"use client"
import React, { useState, useEffect } from 'react'
import { X, Save, Search } from 'lucide-react'
import { getStudents } from '@/lib/studentActions' // Ambil dari modul murid sebelumnya

interface Props {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: any) => void
}

export default function PaymentFormModal({ isOpen, onClose, onSubmit }: Props) {
    const [students, setStudents] = useState<any[]>([])
    const [form, setForm] = useState({
        student_id: '',
        title: '',
        amount: '',
        method: 'CASH',
        status: 'LUNAS',
        payment_date: new Date().toISOString().split('T')[0],
        notes: ''
    })

    // Load data murid untuk dropdown
    useEffect(() => {
        if (isOpen) {
            getStudents().then(res => setStudents(res.students || [])).catch(console.error)
        }
    }, [isOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(form)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold text-xl text-gray-800">Input Pembayaran</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Pilih Murid */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Murid</label>
                        <select 
                            required
                            className="w-full border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#0077AF] outline-none"
                            value={form.student_id}
                            onChange={e => setForm({...form, student_id: e.target.value})}
                        >
                            <option value="">-- Pilih Murid --</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.name} - {s.phone_number}</option>
                            ))}
                        </select>
                    </div>

                    {/* Judul Pembayaran */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Keterangan / Paket</label>
                        <input 
                            type="text" required 
                            placeholder="Contoh: SPP Oktober 2025"
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0077AF] outline-none"
                            value={form.title}
                            onChange={e => setForm({...form, title: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nominal (Rp)</label>
                            <input 
                                type="number" required 
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0077AF] outline-none"
                                value={form.amount}
                                onChange={e => setForm({...form, amount: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal</label>
                            <input 
                                type="date" required 
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0077AF] outline-none"
                                value={form.payment_date}
                                onChange={e => setForm({...form, payment_date: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Metode</label>
                            <select 
                                className="w-full border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#0077AF] outline-none"
                                value={form.method}
                                onChange={e => setForm({...form, method: e.target.value})}
                            >
                                <option value="CASH">💵 Tunai (Cash)</option>
                                <option value="TRANSFER">🏦 Transfer Bank</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                            <select 
                                className="w-full border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#0077AF] outline-none"
                                value={form.status}
                                onChange={e => setForm({...form, status: e.target.value})}
                            >
                                <option value="LUNAS">✅ Lunas</option>
                                <option value="BELUM_LUNAS">⏳ Belum Lunas</option>
                                <option value="JATUH_TEMPO">⚠️ Jatuh Tempo</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-[#0077AF] hover:bg-[#006699] text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2 mt-4">
                        <Save size={18} /> Simpan Pembayaran
                    </button>
                </form>
            </div>
        </div>
    )
}