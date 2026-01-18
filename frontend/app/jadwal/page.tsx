"use client"

import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Plus, Calendar, Trash2, User, Clock, BookOpen } from 'lucide-react'
import { getSchedules, deleteSchedule, Schedule } from '@/lib/jadwalActions'
import JadwalFormModal from '@/components/JadwalFormModal'
import { useUser } from '@/context/UserContext'
import { useLoading } from '@/context/LoadingContext'

export default function JadwalPage() {
    const { user } = useUser()
    const { withLoading } = useLoading()
    
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)

    const role = user?.role || ''
    const canEdit = ['OWNER', 'ADMIN'].includes(role)

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
        if (!confirm("Hapus jadwal ini? Tindakan ini tidak dapat dibatalkan.")) return

        await withLoading(async () => {
            try {
                await deleteSchedule(id)
                fetchData()
            } catch (error) {
                alert("Gagal menghapus jadwal")
            }
        })
    }

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('id-ID', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        })
    }

    return (
        <DashboardLayout title="Jadwal Kelas">
            {/* Header & Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                        <Calendar className="text-[#0077AF]" size={28} />
                        Jadwal Sesi Belajar
                    </h2>
                    <p className="text-gray-500 text-sm">Kelola dan pantau waktu belajar aktif murid</p>
                </div>
                
                {canEdit && (
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="bg-[#0077AF] hover:bg-[#006699] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
                    >
                        <Plus size={20} /> Tambah Jadwal Baru
                    </button>
                )}
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-400 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Waktu Sesi</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Murid</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Mentor</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Mata Pelajaran</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Progress Paket</th>
                                {canEdit && <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {schedules.length === 0 ? (
                                <tr>
                                    <td colSpan={canEdit ? 6 : 5} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <Calendar size={48} className="opacity-20" />
                                            <p className="italic">Belum ada jadwal yang direncanakan.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                schedules.map((s: any) => {
                                    const totalSessions = s.total_sessions || 0
                                    const totalDone = s.total_done || 0
                                    const progress = totalSessions > 0 ? Math.min(100, Math.round((totalDone / totalSessions) * 100)) : 0
                                    
                                    return (
                                        <tr key={s.id} className="hover:bg-blue-50/20 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-gray-800">{formatDate(s.date)}</div>
                                                <div className="flex items-center gap-1.5 text-sm text-[#0077AF] font-semibold mt-1">
                                                    <Clock size={14} />
                                                    {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="font-semibold text-gray-700">{s.students?.name || '-'}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <User size={14} className="text-gray-400" />
                                                    </div>
                                                    <span className="text-sm">{(s as any).mentors?.name || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen size={14} className="text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-600">{s.subject || 'Umum'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="w-40">
                                                    <div className="flex justify-between text-xs mb-1 font-bold">
                                                        <span className="text-gray-500">{totalDone}/{totalSessions}</span>
                                                        <span className={progress >= 100 ? "text-green-600" : "text-[#0077AF]"}>{progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                        <div 
                                                            className={`h-full transition-all duration-500 rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-[#0077AF]'}`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            {canEdit && (
                                                <td className="px-6 py-5 text-center">
                                                    <button 
                                                        onClick={() => handleDelete(s.id)} 
                                                        className="text-gray-300 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                        title="Hapus Jadwal"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <JadwalFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchData} 
            />
        </DashboardLayout>
    )
}