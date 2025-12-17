"use client"
import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Plus, Calendar, Trash2, Loader2, User } from 'lucide-react'
import { getSchedules, deleteSchedule, Schedule } from '@/lib/jadwalActions'
import JadwalFormModal from '@/components/JadwalFormModal'
import { getUserRole } from '@/lib/auth'

export default function JadwalPage() {
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [role, setRole] = useState<string | null>(null)

    // Load Data
    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await getSchedules()
            setSchedules(res.schedules || [])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setRole(getUserRole())
        fetchData()
    }, [])

    const handleDelete = async (id: string) => {
        if(confirm("Hapus jadwal ini?")) {
            await deleteSchedule(id)
            fetchData()
        }
    }

    const canEdit = role === 'OWNER' || role === 'ADMIN';

    // Helper format tanggal (Opsional, untuk tampilan lebih bagus)
    const formatDate = (dateStr: string) => {
        if(!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    return (
        <DashboardLayout title="Jadwal Kelas">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                    <Calendar />
                    {/* Ubah text judul */}
                    <span className="font-medium">Jadwal Sesi Kelas</span>
                </div>
                {canEdit && (
                    <button onClick={() => setIsModalOpen(true)} className="bg-[#0077AF] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm hover:bg-[#006699]">
                        <Plus size={16} /> Tambah Jadwal
                    </button>
                )}
            </div>

            {/* Tabel Jadwal */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700">Tanggal & Jam</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700">Murid</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700">Mentor</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-700">Mapel</th>
                            {canEdit && <th className="px-6 py-4 text-sm font-bold text-gray-700">Aksi</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                             <tr><td colSpan={5} className="p-8 text-center text-gray-500"><Loader2 className="inline animate-spin"/> Memuat...</td></tr>
                        ) : schedules.length === 0 ? (
                             <tr><td colSpan={5} className="p-8 text-center text-gray-400">Belum ada jadwal sesi.</td></tr>
                        ) : (
                            schedules.map((s) => (
                                <tr key={s.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        {/* ✅ PERBAIKAN: Menampilkan Tanggal (date) */}
                                        <div className="font-bold text-gray-800">{formatDate(s.date)}</div>
                                        <div className="text-sm text-gray-500">{s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-700">{s.students?.name || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-gray-400"/>
                                            {(s as any).mentors?.name || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold border border-blue-100">
                                            {s.subject || 'Umum'}
                                        </span>
                                    </td>
                                    {canEdit && (
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <JadwalFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchData} 
            />
        </DashboardLayout>
    )
}