import React, { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { getCategories } from '@/lib/transactionActions'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: any) => void
    type: 'INCOME' | 'EXPENSE'
}

export default function TransactionFormModal({ isOpen, onClose, onSubmit, type }: Props) {
    const [categories, setCategories] = useState<any[]>([])
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        category_id: '',
        amount: '',
        description: ''
    })

    useEffect(() => {
        if (isOpen) {
            getCategories(type).then(setCategories)
        }
    }, [isOpen, type])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({ ...form, type })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="font-bold text-xl text-gray-800">
                        Input {type === 'EXPENSE' ? 'Pengeluaran' : 'Pemasukan'}
                    </h2>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-red-500" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal</label>
                        <input type="date" required 
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#0077AF] outline-none"
                            value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori</label>
                        <select required 
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#0077AF] outline-none bg-white"
                            value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}
                        >
                            <option value="">Pilih Kategori</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nominal (Rp)</label>
                        <input type="number" required placeholder="0"
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#0077AF] outline-none"
                            value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Keterangan</label>
                        <textarea rows={2} placeholder="Catatan tambahan..."
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#0077AF] outline-none"
                            value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                        />
                    </div>

                    <button type="submit" className="w-full bg-[#0077AF] hover:bg-[#006699] text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2 mt-4">
                        <Save size={18} /> Simpan Transaksi
                    </button>
                </form>
            </div>
        </div>
    )
}