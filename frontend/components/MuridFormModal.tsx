// components/MuridFormModal.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react'; 
import { createStudent, updateStudent, Student } from '@/lib/studentActions'; 

interface MuridFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; 
    editingStudent: Student | null; 
}

// Helper Input Component (Style Pill)
const PillInput = ({ label, ...props }: any) => (
    <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>
        <input 
            className="border border-gray-400 rounded-full px-5 py-2.5 focus:outline-none focus:border-[#0077AF] focus:ring-1 focus:ring-[#0077AF] text-sm w-full"
            {...props}
        />
    </div>
);

const MuridFormModal: React.FC<MuridFormModalProps> = ({ isOpen, onClose, onSuccess, editingStudent }) => {
    
    const [formData, setFormData] = useState({
        name: '', age: '', phone_number: '', address: '', parent_name: '', parent_phone: '', status: 'AKTIF'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = !!editingStudent;

    useEffect(() => {
        if (editingStudent) {
            setFormData({
                name: editingStudent.name,
                age: editingStudent.age.toString(),
                phone_number: editingStudent.phone_number,
                address: editingStudent.address,
                parent_name: (editingStudent as any).parent_name || '',
                parent_phone: (editingStudent as any).parent_phone || '',
                status: editingStudent.status
            });
        } else {
            setFormData({ name: '', age: '', phone_number: '', address: '', parent_name: '', parent_phone: '', status: 'AKTIF' });
        }
        setError(null);
    }, [editingStudent, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validasi Sederhana
        if (!formData.name || !formData.phone_number) {
             setError("Nama dan Nomor HP wajib diisi.");
             setLoading(false);
             return;
        }

        try {
            const payload = { ...formData, age: Number(formData.age) || 0 };
            
            if (isEditMode && editingStudent?.id) {
                await updateStudent(editingStudent.id, payload);
            } else {
                await createStudent(payload);
            }
            onSuccess(); 
            onClose();
        } catch (err: any) {
            setError(err.message || 'Gagal menyimpan data.');
        } finally { 
            setLoading(false); 
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[95vh]">
                
                {/* Header Biru Solid */}
                <div className="bg-[#0077AF] px-6 py-5 flex justify-between items-center relative">
                    <h2 className="text-white text-xl font-bold mx-auto">
                        {isEditMode ? 'Edit Data Murid' : 'Tambah Murid Baru'}
                    </h2>
                    <button onClick={onClose} className="text-white absolute right-6 hover:text-gray-200 transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        
                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm border border-red-200 text-center">
                                {error}
                            </div>
                        )}

                        <PillInput 
                            label="Nama Lengkap *" value={formData.name} 
                            onChange={(e:any) => setFormData({...formData, name: e.target.value})} 
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <PillInput 
                                label="No HP *" placeholder="08..." value={formData.phone_number}
                                onChange={(e:any) => setFormData({...formData, phone_number: e.target.value})} 
                            />
                            <PillInput 
                                label="Usia *" type="number" value={formData.age}
                                onChange={(e:any) => setFormData({...formData, age: e.target.value})} 
                            />
                        </div>

                        <PillInput 
                            label="Alamat *" value={formData.address}
                            onChange={(e:any) => setFormData({...formData, address: e.target.value})} 
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <PillInput 
                                label="Nama Ortu *" value={formData.parent_name}
                                onChange={(e:any) => setFormData({...formData, parent_name: e.target.value})} 
                            />
                            <PillInput 
                                label="No HP (Ortu) *" placeholder="08..." value={formData.parent_phone}
                                onChange={(e:any) => setFormData({...formData, parent_phone: e.target.value})} 
                            />
                        </div>

                        {/* Status Select */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Status *</label>
                            <div className="relative">
                                <select 
                                    className="w-full border border-gray-400 rounded-full px-5 py-2.5 focus:outline-none appearance-none bg-white text-sm cursor-pointer hover:border-[#0077AF]"
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                >
                                    <option value="AKTIF">Aktif</option>
                                    <option value="NON-AKTIF">Non-Aktif</option>
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex justify-center gap-4 mt-6">
                            <button type="button" onClick={onClose} className="px-8 py-3 rounded-full border border-gray-300 text-gray-700 font-bold shadow-sm hover:bg-gray-50 transition">
                                Batal
                            </button>
                            <button type="submit" disabled={loading} className="px-6 py-3 rounded-full bg-[#00558F] text-white font-bold shadow-md hover:bg-[#004475] flex items-center transition disabled:opacity-70">
                                <Plus size={20} className="mr-2" /> {loading ? 'Menyimpan...' : (isEditMode ? 'Simpan Data' : 'Tambah Murid')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MuridFormModal;