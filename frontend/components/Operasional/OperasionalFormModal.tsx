"use client"

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Swal from 'sweetalert2'
import { fetchWithAuth } from '@/lib/apiClient'
import { API_URL_BASE } from '@/lib/financeActions'
import { useLoading } from '@/context/LoadingContext'

interface Props {
    isOpen: boolean
    onClose: () => void
    editingItem: any | null
    kategoriList: any[]
    onSuccess: () => void
}

export const OperasionalFormModal = ({ isOpen, onClose, editingItem, kategoriList, onSuccess }: Props) => {
    const { withLoading } = useLoading()
    const [formData, setFormData] = useState({
        nama_pengeluaran: '',
        kategori_id: '',
        jumlah: '',
        tipe_periode: 'HARIAN',
        tanggal: new Date().toISOString().split('T')[0],
        deskripsi: ''
    })

    useEffect(() => {
        if (editingItem) {
            setFormData({
                nama_pengeluaran: editingItem.nama_pengeluaran,
                kategori_id: editingItem.kategori_id,
                jumlah: editingItem.jumlah.toString(),
                tipe_periode: editingItem.tipe_periode,
                tanggal: editingItem.tanggal.split('T')[0],
                deskripsi: editingItem.deskripsi || ''
            })
        } else {
            setFormData({
                nama_pengeluaran: '',
                kategori_id: '',
                jumlah: '',
                tipe_periode: 'HARIAN',
                tanggal: new Date().toISOString().split('T')[0],
                deskripsi: ''
            })
        }
    }, [editingItem, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await withLoading(async () => {
            try {
                const url = editingItem 
                    ? `${API_URL_BASE}/operasional/${editingItem.id}` 
                    : `${API_URL_BASE}/operasional`
                
                const method = editingItem ? 'PUT' : 'POST'
                
                const response = await fetchWithAuth(url, {
                    method,
                    body: JSON.stringify({
                        ...formData,
                        jumlah: parseFloat(formData.jumlah)
                    })
                })

                if (!response.ok) throw new Error('Gagal menyimpan data')

                Swal.fire('Berhasil', 'Data operasional disimpan', 'success')
                onSuccess()
                onClose()
            } catch (error: any) {
                Swal.fire('Error', error.message, 'error')
            }
        })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h3 className="text-xl font-bold text-gray-800">
                            {editingItem ? 'Edit Biaya' : 'Tambah Biaya Baru'}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Pengeluaran</label>
                            <input
                                type="text" required
                                value={formData.nama_pengeluaran}
                                onChange={(e) => setFormData({...formData, nama_pengeluaran: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077AF] outline-none"
                                placeholder="Contoh: Listrik Kantor"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kategori</label>
                                <select
                                    required value={formData.kategori_id}
                                    onChange={(e) => setFormData({...formData, kategori_id: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="">Pilih...</option>
                                    {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama_kategori}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Periode</label>
                                <select
                                    required value={formData.tipe_periode}
                                    onChange={(e) => setFormData({...formData, tipe_periode: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="HARIAN">Harian</option>
                                    <option value="MINGGUAN">Mingguan</option>
                                    <option value="BULANAN">Bulanan</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Jumlah (Rp)</label>
                            <input
                                type="number" required
                                value={formData.jumlah}
                                onChange={(e) => setFormData({...formData, jumlah: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-[#0077AF]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tanggal</label>
                            <input
                                type="date" required
                                value={formData.tanggal}
                                onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                            />
                        </div>

                        <div className="flex gap-3 pt-6">
                            <button
                                type="button" onClick={onClose}
                                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-[#0077AF] text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-[#005a8a] transition-all"
                            >
                                Simpan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}