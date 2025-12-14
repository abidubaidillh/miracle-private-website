// components/MuridFormModal.tsx
"use client"

import React, { useState, useEffect } from 'react';
import Button from './Button'; 
import Input from './Input'; 
import { X, Plus } from 'lucide-react'; // Ikon untuk close dan tambah
import { createStudent, updateStudent, Student } from '@/lib/studentActions'; 

interface MuridFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; 
    editingStudent: Student | null; 
}

// Update FormData untuk mencakup field baru sesuai gambar (Nama Ortu & HP Ortu)
// NOTE: Pastikan database/backend Anda juga mendukung field 'parent_name' dan 'parent_phone'
interface FormData { 
    name: string;
    age: number | string; // Mengizinkan string sementara untuk handling input kosong
    phone_number: string;
    address: string;
    parent_name: string;  // Field Baru Sesuai Gambar
    parent_phone: string; // Field Baru Sesuai Gambar
    status: 'AKTIF' | 'NON-AKTIF';
}

const initialFormData: FormData = {
    name: '',
    age: '', // Kosongkan awal agar placeholder terlihat
    phone_number: '',
    address: '',
    parent_name: '',
    parent_phone: '',
    status: 'AKTIF', 
};

const MuridFormModal: React.FC<MuridFormModalProps> = ({ isOpen, onClose, onSuccess, editingStudent }) => {
    
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = !!editingStudent;

    useEffect(() => {
        if (editingStudent) {
            setFormData({
                name: editingStudent.name,
                age: editingStudent.age,
                phone_number: editingStudent.phone_number,
                address: editingStudent.address,
                // Jika backend belum ada data ortu, gunakan string kosong atau ambil dari editingStudent jika sudah ada
                parent_name: (editingStudent as any).parent_name || '', 
                parent_phone: (editingStudent as any).parent_phone || '',
                status: editingStudent.status,
            });
        } else {
            setFormData(initialFormData);
        }
    }, [editingStudent, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'age' ? (value === '' ? '' : parseInt(value)) : value 
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        // Validasi Sederhana
        if (!formData.name || !formData.phone_number || !formData.age) {
             setError("Mohon lengkapi field yang bertanda bintang (*).");
             setLoading(false);
             return;
        }

        try {
            // Konversi age kembali ke number murni untuk pengiriman
            const submissionData = {
                ...formData,
                age: Number(formData.age)
            };

            if (isEditMode && editingStudent?.id) {
                await updateStudent(editingStudent.id, submissionData);
            } else {
                await createStudent(submissionData); 
            }
            
            setFormData(initialFormData); 
            onSuccess(); 
            onClose(); 
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan saat menyimpan data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            {/* Modal Container with Rounded Corners & Shadow */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* HEADER: Biru Solid sesuai Gambar */}
                <div className="bg-[#0077AF] px-6 py-4 flex justify-between items-center relative">
                    <h2 className="text-xl font-bold text-white text-center w-full">
                        {isEditMode ? "Edit Data Murid" : "Tambah Murid Baru"}
                    </h2>
                    {/* Tombol Close Absolute di kanan atas */}
                    <button 
                        onClick={onClose} 
                        className="absolute right-4 text-white hover:text-gray-200 transition"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm border border-red-200">
                                {error}
                            </div>
                        )}

                        {/* Nama Lengkap (Full Width) */}
                        <div>
                            <Input 
                                label="Nama Lengkap *" 
                                name="name" 
                                type="text" 
                                value={formData.name} 
                                onChange={handleChange} 
                                placeholder=""
                                // Style tambahan untuk membuat input bulat (pill shape) sesuai gambar
                                className="rounded-2xl border-gray-300 focus:border-[#0077AF] focus:ring-[#0077AF]"
                            />
                        </div>

                        {/* Grid: No HP & Usia (Side by Side) */}
                        <div className="grid grid-cols-2 gap-4">
                            <Input 
                                label="No HP *" 
                                name="phone_number" 
                                type="text" 
                                value={formData.phone_number} 
                                onChange={handleChange}
                                placeholder="08......"
                                className="rounded-2xl"
                            />
                            <Input 
                                label="Usia *" 
                                name="age" 
                                type="number" 
                                value={formData.age.toString()} 
                                onChange={handleChange}
                                placeholder=""
                                className="rounded-2xl"
                            />
                        </div>

                        {/* Alamat (Full Width) */}
                        <div>
                            <Input 
                                label="Alamat *" 
                                name="address" 
                                type="text" 
                                value={formData.address} 
                                onChange={handleChange}
                                className="rounded-2xl"
                            />
                        </div>

                        {/* Grid: Nama Ortu & No HP Ortu (Side by Side - SESUAI GAMBAR) */}
                        <div className="grid grid-cols-2 gap-4">
                            <Input 
                                label="Nama Ortu *" 
                                name="parent_name" 
                                type="text" 
                                value={formData.parent_name} 
                                onChange={handleChange}
                                className="rounded-2xl"
                            />
                            <Input 
                                label="No HP (Ortu) *" 
                                name="parent_phone" 
                                type="text" 
                                value={formData.parent_phone} 
                                onChange={handleChange}
                                placeholder="08......"
                                className="rounded-2xl"
                            />
                        </div>

                        {/* Status (Full Width Dropdown) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Status *</label>
                            <div className="relative">
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full border border-gray-400 p-3 rounded-2xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0077AF] appearance-none"
                                >
                                    <option value="AKTIF">Aktif</option>
                                    <option value="NON-AKTIF">Non-Aktif</option>
                                </select>
                                {/* Custom Arrow Icon Position */}
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER BUTTONS */}
                        <div className="mt-8 flex justify-center space-x-4">
                            {/* Tombol Batal: Putih, Shadow, Rounded Pill */}
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="px-8 py-3 rounded-full border border-gray-200 shadow-sm text-gray-700 font-semibold hover:bg-gray-50 transition"
                            >
                                Batal
                            </button>
                            
                            {/* Tombol Tambah: Biru Tua, Icon Plus, Rounded Pill */}
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="flex items-center px-6 py-3 rounded-full bg-[#004A77] text-white font-semibold shadow-md hover:bg-[#00385a] transition disabled:opacity-70"
                            >
                                <Plus size={20} className="mr-2" />
                                {loading ? 'Menyimpan...' : (isEditMode ? 'Simpan Data' : 'Tambah Murid')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MuridFormModal;