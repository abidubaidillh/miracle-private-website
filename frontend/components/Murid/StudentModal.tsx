// components/Murid/StudentModal.tsx
import React, { useState, useEffect } from 'react'
import { X, Save, Smile, User, MapPin } from 'lucide-react'
import { Student } from '@/lib/studentActions'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: any) => void
    initialData: Student | null
}

export const StudentModal = ({ isOpen, onClose, onSubmit, initialData }: ModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        school_origin: '',
        address: '',
        parent_name: '',
        parent_phone: '',
        status: 'AKTIF'
    })

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                age: initialData.age.toString(),
                school_origin: initialData.school_origin || '',
                address: initialData.address || '',
                parent_name: initialData.parent_name || '',
                parent_phone: initialData.parent_phone || '',
                status: initialData.status
            })
        } else {
            setFormData({ 
                name: '', 
                age: '', 
                school_origin: '', 
                address: '', 
                parent_name: '', 
                parent_phone: '', 
                status: 'AKTIF' 
            })
        }
    }, [initialData, isOpen])

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Konversi age ke number sebelum dikirim
        const submittedData = {
            ...formData,
            age: parseInt(formData.age)
        };
        onSubmit(submittedData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm px-4">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="font-bold text-xl text-gray-800">
                            {initialData ? 'Edit Data Murid' : 'Tambah Murid Baru'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Bagian 1: Data Pribadi */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-[#0077AF] uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                            <Smile size={14}/> Data Pribadi
                        </h4>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                            <input 
                                required 
                                type="text" 
                                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#0077AF]"
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                placeholder="Contoh: Budi Santoso"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Usia</label>
                                <input 
                                    required 
                                    type="number" 
                                    placeholder="Thn" 
                                    className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#0077AF]"
                                    value={formData.age} 
                                    onChange={e => setFormData({...formData, age: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Asal Sekolah</label>
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="Sekolah" 
                                    className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#0077AF]"
                                    value={formData.school_origin} 
                                    onChange={e => setFormData({...formData, school_origin: e.target.value})} 
                                />
                            </div>
                        </div>

                        {/* FIELD ALAMAT (YANG SEBELUMNYA HILANG) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                <MapPin size={14} /> Alamat
                            </label>
                            <textarea 
                                required 
                                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#0077AF] min-h-[80px]"
                                value={formData.address} 
                                onChange={e => setFormData({...formData, address: e.target.value})} 
                                placeholder="Masukkan alamat lengkap rumah murid..."
                            />
                        </div>
                    </div>

                    {/* Bagian 2: Data Orang Tua */}
                    <div className="bg-blue-50 p-4 rounded-lg space-y-4 border border-blue-100">
                        <h4 className="text-xs font-bold text-[#0077AF] uppercase tracking-wider flex items-center gap-2">
                            <User size={14}/> Data Orang Tua
                        </h4>
                        <div>
                            <input 
                                required 
                                type="text" 
                                placeholder="Nama Orang Tua" 
                                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0077AF]"
                                value={formData.parent_name} 
                                onChange={e => setFormData({...formData, parent_name: e.target.value})} 
                            />
                        </div>
                        <div>
                            <input 
                                required 
                                type="text" 
                                placeholder="No HP / WhatsApp (Contoh: 0812...)" 
                                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0077AF]"
                                value={formData.parent_phone} 
                                onChange={e => setFormData({...formData, parent_phone: e.target.value})} 
                            />
                        </div>
                    </div>

                    {/* Status Murid */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Status Murid</label>
                        <select 
                            className="w-full border rounded-lg px-4 py-2 bg-white outline-none focus:ring-2 focus:ring-[#0077AF]"
                            value={formData.status} 
                            onChange={e => setFormData({...formData, status: e.target.value})}
                        >
                            <option value="AKTIF">✅ Murid Aktif</option>
                            <option value="NON-AKTIF">❌ Tidak Aktif</option>
                        </select>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="pt-2">
                        <button 
                            type="submit" 
                            className="w-full bg-[#0077AF] hover:bg-[#005f8d] text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition-all shadow-md active:scale-[0.98]"
                        >
                            <Save size={18} /> 
                            {initialData ? 'Simpan Perubahan' : 'Simpan Data Murid'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}