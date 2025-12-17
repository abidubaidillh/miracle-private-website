"use client"

import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Plus, Calendar, Trash2, User } from 'lucide-react'
import { getSchedules, deleteSchedule, Schedule } from '@/lib/jadwalActions'
import JadwalFormModal from '@/components/JadwalFormModal'
import { useUser } from '@/context/UserContext'
import { useLoading } from '@/context/LoadingContext'

export default function JadwalPage() {
    const { user } = useUser()
    const { withLoading } = useLoading()
    
    // State
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Role Check
    const role = user?.role || ''
    const canEdit = ['OWNER', 'ADMIN'].includes(role)

    // Load Data dengan Global Loading Screen
    const fetchData = async () => {
        await withLoading(async () => {
            try {
                const res = await getSchedules()
                setSchedules(res.schedules || [])
            } catch (error) {
                console.error("Gagal mengambil jadwal:", error)
            }
        })
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus jadwal ini?")) return

        await withLoading(async () => {
            try {
                await deleteSchedule(id)
                fetchData() // Refresh data setelah hapus
            } catch (error) {
                alert("Gagal menghapus jadwal")
                console.error(error)
            }
        })
    }

    // Helper format tanggal
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-'
        const date = new Date(dateStr)
        return date.toLocaleDateString('id-ID', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        })
    }

    return (
        <DashboardLayout title="Jadwal Kelas">
            {/* --- ACTION BAR --- */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="text-[#0077AF]" />
                    <span className="font-medium text-lg text-gray-800">Jadwal Sesi Kelas</span>
                </div>
                {canEdit && (
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="bg-[#0077AF] hover:bg-[#006699] text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 text-sm shadow-md transition-all"
                    >
                        <Plus size={18} /> Tambah Jadwal
                    </button>
                )}
            </div>

            {/* --- TABEL JADWAL --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold">Tanggal & Jam</th>
                            <th className="px-6 py-4 text-sm font-bold">Murid</th>
                            <th className="px-6 py-4 text-sm font-bold">Mentor</th>
                            <th className="px-6 py-4 text-sm font-bold">Mapel</th>
                            {canEdit && <th className="px-6 py-4 text-sm font-bold text-center">Aksi</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {schedules.length === 0 ? (
                            <tr>
                                <td colSpan={canEdit ? 5 : 4} className="p-12 text-center text-gray-400">
                                    Belum ada jadwal sesi yang terdaftar.
                                </td>
                            </tr>
                        ) : (
                            schedules.map((s) => (
                                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800">{formatDate(s.date)}</div>
                                        <div className="text-sm text-[#0077AF] font-medium bg-blue-50 w-fit px-2 py-0.5 rounded mt-1">
                                            {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-700">
                                        {s.students?.name || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-gray-400" />
                                            {(s as any).mentors?.name || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded text-xs font-semibold border border-gray-200">
                                            {s.subject || 'Umum'}
                                        </span>
                                    </td>
                                    {canEdit && (
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleDelete(s.id)} 
                                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                                                title="Hapus Jadwal"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL FORM --- */}
            <JadwalFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchData} 
            />
        </DashboardLayout>
    )
}