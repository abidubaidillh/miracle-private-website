"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Search, UserPlus, Pencil, Trash2, Users, CheckCircle, XCircle, MapPin, School } from 'lucide-react'
import { getStudents, createStudent, updateStudent, deleteStudent, Student } from '@/lib/studentActions'
import { useLoading } from '@/context/LoadingContext'
import { useUser } from '@/context/UserContext'
import { StatCard } from '@/components/Dashboard/StatCard'
import { StudentModal } from '@/components/Murid/StudentModal'

export default function MuridPage() {
    const { withLoading } = useLoading()
    const { user } = useUser()
    const [searchQuery, setSearchQuery] = useState('')
    const [students, setStudents] = useState<Student[]>([])
    const [stats, setStats] = useState({ active: 0, inactive: 0 })
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingStudent, setEditingStudent] = useState<Student | null>(null)

    const canEdit = ['OWNER', 'ADMIN'].includes(user?.role || '')

    const fetchStudents = async () => {
        await withLoading(async () => {
            try {
                const result = await getStudents(searchQuery)
                setStudents(result.students || [])
                setStats(result.stats || { active: 0, inactive: 0 })
            } catch (err) { console.error(err) }
        })
    }

    useEffect(() => {
        const timer = setTimeout(fetchStudents, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleFormSubmit = async (formData: any) => {
        await withLoading(async () => {
            try {
                if (editingStudent) await updateStudent(editingStudent.id, formData)
                else await createStudent(formData)
                setIsModalOpen(false)
                setEditingStudent(null)
                fetchStudents() 
            } catch (err: any) { alert(err.message) }
        })
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Hapus murid: ${name}?`)) return
        await withLoading(async () => {
            try {
                await deleteStudent(id)
                fetchStudents()
            } catch (error) { alert("Gagal hapus") }
        })
    }

    return (
        <DashboardLayout title="Data Murid">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard icon={Users} label="Total Murid" count={students.length} colorClass="bg-blue-100" iconColor="text-[#0077AF]" />
                <StatCard icon={CheckCircle} label="Murid Aktif" count={stats.active} colorClass="bg-green-100" iconColor="text-green-600" />
                <StatCard icon={XCircle} label="Tidak Aktif" count={stats.inactive} colorClass="bg-red-100" iconColor="text-red-600" />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-96">
                    <input type="text" placeholder="Cari murid..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-[#0077AF] outline-none" />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                </div>
                {canEdit && (
                    <button onClick={() => { setEditingStudent(null); setIsModalOpen(true); }}
                        className="flex items-center px-6 py-2.5 bg-[#0077AF] text-white rounded-lg font-bold gap-2 shadow-md">
                        <UserPlus size={18} /> Tambah Murid
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-700 border-b">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase">Nama & Sekolah</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-center">Usia</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase">Orang Tua</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-center">Status</th>
                                {canEdit && <th className="px-6 py-4 text-xs font-bold uppercase text-center">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {students.map((m) => (
                                <tr key={m.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800">{m.name}</div>
                                        <div className="flex items-center gap-1 text-xs text-[#0077AF] mt-1">
                                            <School size={10} /> {m.school_origin || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{m.age} Thn</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold">{m.parent_name}</p>
                                        <p className="text-xs text-gray-500 font-mono">{m.parent_phone}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${m.status === 'AKTIF' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                            {m.status}
                                        </span>
                                    </td>
                                    {canEdit && (
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => { setEditingStudent(m); setIsModalOpen(true); }} className="p-2 bg-yellow-50 text-yellow-600 rounded-lg border border-yellow-200 hover:bg-yellow-100">
                                                    <Pencil size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(m.id, m.name)} className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <StudentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} initialData={editingStudent} />
        </DashboardLayout>
    )
}