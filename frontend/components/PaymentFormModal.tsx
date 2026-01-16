"use client"
import React, { useState, useEffect } from 'react'
import { X, Save, UploadCloud, CheckCircle, AlertCircle } from 'lucide-react'
import { getStudents, Student } from '@/lib/studentActions'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: any) => void
}

export default function PaymentFormModal({ isOpen, onClose, onSubmit }: Props) {
    // Gunakan tipe Student yang sudah kita perbarui di studentActions.ts
    const [students, setStudents] = useState<Student[]>([])
    const [proofFile, setProofFile] = useState<File | null>(null)
    
    const [form, setForm] = useState({
        student_id: '',
        title: '',
        amount: '',
        method: 'CASH',
        status: 'LUNAS',
        payment_date: new Date().toISOString().split('T')[0],
        notes: ''
    })

    // Reset form saat modal dibuka
    useEffect(() => {
        if (isOpen) {
            getStudents()
                .then(res => setStudents(res.students || []))
                .catch(console.error)
            setProofFile(null) 
            setForm(prev => ({ ...prev, status: 'LUNAS', method: 'CASH', student_id: '' })) 
        }
    }, [isOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        onSubmit({ 
            ...form, 
            proof_file: form.status === 'LUNAS' ? proofFile : null,
            method: form.status === 'LUNAS' ? form.method : null 
        })
    }

    if (!isOpen) return null

    const showPaymentDetails = form.status === 'LUNAS'

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl relative">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold text-xl text-gray-800">Input Pembayaran</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* STATUS */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Status Pembayaran</label>
                        <select 
                            className={`w-full border rounded-lg px-4 py-2 outline-none font-bold transition-colors ${
                                form.status === 'LUNAS' ? 'bg-green-50 border-green-200 text-green-700' :
                                form.status === 'JATUH_TEMPO' ? 'bg-red-50 border-red-200 text-red-700' :
                                'bg-yellow-50 border-yellow-200 text-yellow-700'
                            }`}
                            value={form.status}
                            onChange={e => setForm({...form, status: e.target.value})}
                        >
                            <option value="LUNAS">✅ Lunas </option>
                            <option value="BELUM_LUNAS">⏳ Belum Lunas </option>
                            <option value="JATUH_TEMPO">⚠️ Jatuh Tempo </option>
                        </select>
                        
                        {form.status === 'JATUH_TEMPO' && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <AlertCircle size={12}/> Status ini menandakan tagihan yang sudah lewat tenggat waktu.
                            </p>
                        )}
                    </div>

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
                                <option key={s.id} value={s.id}>
                                    {s.name} - {s.school_origin || 'Tanpa Sekolah'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Judul & Nominal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Keterangan / Paket</label>
                            <input 
                                type="text" required 
                                placeholder="Contoh: SPP Oktober 2025"
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0077AF] outline-none"
                                value={form.title}
                                onChange={e => setForm({...form, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nominal (Rp)</label>
                            <input 
                                type="number" required 
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0077AF] outline-none font-mono"
                                value={form.amount}
                                onChange={e => setForm({...form, amount: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                {form.status === 'LUNAS' ? 'Tanggal Bayar' : 'Tanggal Tagihan'}
                            </label>
                            <input 
                                type="date" required 
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0077AF] outline-none"
                                value={form.payment_date}
                                onChange={e => setForm({...form, payment_date: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* --- CONDITIONAL RENDERING --- */}
                    {showPaymentDetails && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4 animate-fade-in">
                            <div className="flex items-center gap-2 mb-2 border-b border-blue-200 pb-2">
                                <span className="text-xs font-bold text-[#0077AF] uppercase tracking-wider">Detail Pembayaran</span>
                            </div>

                            {/* Metode Pembayaran */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Metode Pembayaran</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setForm({...form, method: 'CASH'})}
                                        className={`py-2 px-3 rounded-lg text-sm font-bold border transition-all ${
                                            form.method === 'CASH' 
                                            ? 'bg-[#0077AF] text-white border-[#0077AF]' 
                                            : 'bg-white text-gray-600 border-gray-300 hover:border-[#0077AF]'
                                        }`}
                                    >
                                        💵 Tunai
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({...form, method: 'TRANSFER'})}
                                        className={`py-2 px-3 rounded-lg text-sm font-bold border transition-all ${
                                            form.method === 'TRANSFER' 
                                            ? 'bg-[#0077AF] text-white border-[#0077AF]' 
                                            : 'bg-white text-gray-600 border-gray-300 hover:border-[#0077AF]'
                                        }`}
                                    >
                                        🏦 Transfer
                                    </button>
                                </div>
                            </div>

                            {/* Upload Bukti */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Bukti Pembayaran 
                                    {form.method === 'TRANSFER' && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                    />
                                    <div className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-all bg-white ${
                                        proofFile ? 'border-green-500' : 'border-gray-300 hover:border-[#0077AF]'
                                    }`}>
                                        {proofFile ? (
                                            <div className="flex items-center gap-2 text-green-700">
                                                <CheckCircle size={20} />
                                                <span className="text-sm font-bold truncate max-w-[200px]">{proofFile.name}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-gray-500">
                                                <UploadCloud size={24} className="mb-1" />
                                                <span className="text-xs">Klik untuk upload foto struk</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="w-full bg-[#0077AF] hover:bg-[#006699] text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2 mt-4 shadow-md transition-transform active:scale-95">
                        <Save size={18} /> Simpan Data
                    </button>
                </form>
            </div>
        </div>
    )
}