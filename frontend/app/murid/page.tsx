// frontend/app/murid/page.tsx
"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Search, UserPlus, Pencil, Trash2, Loader2, GraduationCap } from 'lucide-react'
import MuridFormModal from '@/components/MuridFormModal' 
import { getStudentsData, deleteStudent, Student } from '@/lib/studentActions' 

// Komponen Pill Statistik
const StatPill = ({ icon: Icon, count, label, colorClass }: any) => (
    <div className={`flex items-center px-5 py-2 rounded-full text-white text-sm font-bold shadow-sm ${colorClass}`}>
        <Icon size={18} className="mr-2" />
        <span>{label} : {count}</span>
    </div>
)

export default function MuridPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [muridData, setMuridData] = useState<Student[]>([])
    const [activeCount, setActiveCount] = useState(0)
    const [inactiveCount, setInactiveCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false) 
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    const fetchStudents = async () => {
        setLoading(true)
        try {
            const result = await getStudentsData(searchQuery)
            setMuridData(result.students || []) 
            setActiveCount(result.activeCount)
            setInactiveCount(result.inactiveCount)
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false)
        }
    }
    
    useEffect(() => { fetchStudents() }, [searchQuery]) 
    
    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Hapus murid ${name}?`)) {
            await deleteStudent(id);
            fetchStudents();
        }
    }

    return (
        <DashboardLayout title="Data Murid">
            
            {/* Top Bar: Stats & Add Button */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex gap-4">
                    <StatPill icon={GraduationCap} label="Murid Aktif" count={activeCount} colorClass="bg-[#5AB267]" />
                    <StatPill icon={GraduationCap} label="Murid Non-Aktif" count={inactiveCount} colorClass="bg-[#FF0000]" />
                </div>

                <button
                    onClick={() => { setEditingStudent(null); setIsModalOpen(true); }}
                    className="flex items-center px-6 py-2.5 bg-[#00558F] text-white rounded-lg font-bold text-sm hover:bg-[#004475] transition shadow-md"
                >
                    <UserPlus size={18} className="mr-2" /> + Tambah Murid
                </button>
            </div>

            {/* Search Bar (Gray Background, Rounded Full) */}
            <div className="mb-6 w-full max-w-md">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Cari Murid"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-[#CFCFCF] text-gray-700 font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-[#0077AF] placeholder-white transition-colors"
                    />
                    <Search className="absolute left-4 top-3.5 text-white" size={20} />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#0077AF] text-white">
                        <tr>
                            {['Nama', 'Usia', 'No HP', 'Alamat', 'Status', 'Aksi'].map((h) => (
                                <th key={h} className="px-6 py-4 font-bold text-sm tracking-wide">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {loading ? (
                            <tr><td colSpan={6} className="p-12 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2"/>Memuat data...</td></tr>
                        ) : muridData.length === 0 ? (
                            <tr><td colSpan={6} className="p-12 text-center text-gray-400">Data tidak ditemukan</td></tr>
                        ) : muridData.map((m) => (
                            <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-semibold text-gray-800">{m.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{m.age}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{m.phone_number}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{m.address}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-4 py-1 rounded-full text-[11px] font-bold text-white uppercase tracking-wider ${m.status === 'AKTIF' ? 'bg-[#5AB267]' : 'bg-[#FF0000]'}`}>
                                        {m.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex gap-3">
                                    <button onClick={() => { setEditingStudent(m); setIsModalOpen(true); }} className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded">
                                        <Pencil size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(m.id, m.name)} className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <MuridFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchStudents}
                editingStudent={editingStudent}
            />
        </DashboardLayout>
    )
}