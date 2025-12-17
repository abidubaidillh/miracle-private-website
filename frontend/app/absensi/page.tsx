"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Calendar, User, BookOpen, Clock, CheckCircle } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { useLoading } from '@/context/LoadingContext'
import { getAuthToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export default function AbsensiPage() {
    const { user } = useUser()
    const { withLoading } = useLoading()
    
    // Filter Bulan & Tahun
    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [year, setYear] = useState(new Date().getFullYear())
    
    // State Data (Default array kosong)
    const [schedules, setSchedules] = useState<any[]>([])

    // --- FETCH DATA ---
    const fetchAbsensi = async () => {
        if (!user) return

        await withLoading(async () => {
            try {
                const token = getAuthToken()
                
                // 1. Siapkan Query Params
                let queryParams = `month=${month}&year=${year}`
                
                // 2. Cek Role: Jika MENTOR, kirim ID-nya agar backend memfilter
                if (user.role === 'MENTOR') {
                    queryParams += `&mentor_id=${user.id}`
                }

                // 3. Panggil API
                const res = await fetch(`${API_URL}/attendance?${queryParams}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                
                const data = await res.json()

                // 4. Validasi Data (Agar tidak error .map)
                if (Array.isArray(data)) {
                    setSchedules(data)
                } else {
                    console.error("Format data backend salah:", data)
                    setSchedules([]) 
                }

            } catch (err) {
                console.error("Gagal mengambil data absensi:", err)
                setSchedules([])
            }
        })
    }

    // Load saat komponen siap atau filter berubah
    useEffect(() => { if(user) fetchAbsensi() }, [user, month, year])

    // --- HANDLE KLIK ABSEN ---
    const handleToggleSession = async (schedule: any, sessionNum: number) => {
        // 1. Optimistic Update (Ubah UI duluan biar cepat)
        const originalSchedules = [...schedules] 
        
        const updatedSchedules = schedules.map(s => {
            if(s.id === schedule.id) {
                const newSessions = s.sessions_status.map((sess: any) => 
                    sess.number === sessionNum ? { ...sess, is_done: !sess.is_done } : sess
                )
                
                const newTotalDone = newSessions.filter((ns:any) => ns.is_done).length
                
                return { ...s, sessions_status: newSessions, total_done: newTotalDone }
            }
            return s
        })
        setSchedules(updatedSchedules)

        // 2. Kirim ke Backend
        try {
            const token = getAuthToken()
            const res = await fetch(`${API_URL}/attendance/toggle`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({
                    schedule_id: schedule.id,
                    mentor_id: schedule.mentors.id,
                    session_number: sessionNum,
                    month, 
                    year,
                    status: 'HADIR'
                })
            })

            if (!res.ok) throw new Error("Gagal menyimpan ke server")

        } catch (err) {
            alert("Gagal menyimpan absensi, koneksi bermasalah.")
            setSchedules(originalSchedules) // Revert jika gagal
        }
    }

    if (!user) return null

    return (
        <DashboardLayout title="Absensi Kelas">
            
            {/* --- FILTER SECTION --- */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-700 font-bold bg-gray-50 px-3 py-1.5 rounded-lg border">
                        <Calendar size={18} className="text-[#0077AF]" />
                        <span>Periode:</span>
                    </div>
                    <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="bg-white border rounded p-2 outline-none focus:ring-2 focus:ring-[#0077AF]">
                        {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Bulan {i+1}</option>)}
                    </select>
                    <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="bg-white border rounded p-2 outline-none focus:ring-2 focus:ring-[#0077AF]">
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                    </select>
                </div>
                
                {/* Badge Info Role */}
                {user.role === 'MENTOR' && (
                    <div className="bg-blue-50 text-[#0077AF] px-3 py-1 rounded text-xs font-bold border border-blue-100 flex items-center gap-2">
                        <User size={14}/> Mode Mentor: {user.name}
                    </div>
                )}
            </div>

            {/* --- CONTENT SECTION --- */}
            {!Array.isArray(schedules) || schedules.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
                    <Calendar size={48} className="mb-4 opacity-50"/>
                    <p className="font-medium text-lg">Tidak ada jadwal kelas di bulan ini.</p>
                    {user.role === 'MENTOR' && <p className="text-sm mt-1">Hubungi admin jika jadwal Anda belum muncul.</p>}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {schedules.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col h-full group">
                            
                            {/* Header Card */}
                            <div className="bg-[#0077AF] p-4 text-white relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg">{item.students?.name}</h3>
                                    <div className="flex items-center gap-2 text-blue-100 text-sm mt-1">
                                        <BookOpen size={14}/> {item.subject || 'Umum'}
                                    </div>
                                </div>
                                <BookOpen size={80} className="absolute -bottom-4 -right-4 text-white opacity-10 rotate-12 group-hover:scale-110 transition-transform"/>
                            </div>

                            {/* Info Card */}
                            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <User size={14}/> <span className="font-medium">{item.mentors?.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={14}/> {item.day_of_week}, {item.start_time?.slice(0,5)}
                                </div>
                            </div>

                            {/* Body Card: Tombol Sesi */}
                            <div className="p-5 flex-1 flex flex-col justify-center">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">
                                    Klik Nomor Sesi Untuk Absen
                                </p>
                                
                                <div className="flex flex-wrap justify-center gap-3">
                                    {item.sessions_status.map((sess: any) => (
                                        <button
                                            key={sess.number}
                                            onClick={() => handleToggleSession(item, sess.number)}
                                            className={`
                                                w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all shadow-sm border-b-2
                                                ${sess.is_done 
                                                    ? 'bg-green-500 border-green-700 text-white scale-110 shadow-green-200' 
                                                    : 'bg-white border-gray-300 text-gray-400 hover:border-[#0077AF] hover:text-[#0077AF] hover:bg-blue-50'}
                                            `}
                                            title={sess.is_done ? `Sesi ${sess.number}: Hadir` : `Absen Sesi ${sess.number}`}
                                        >
                                            {sess.is_done ? <CheckCircle size={20}/> : sess.number}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Footer Card: Progress */}
                            <div className="p-4 bg-gray-50 border-t border-gray-100">
                                <div className="flex justify-between text-xs mb-1 font-bold text-gray-500">
                                    <span>Kehadiran</span>
                                    <span className={item.total_done > 0 ? "text-[#0077AF]" : ""}>{item.total_done} / {item.sessions_status.length}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className={`h-1.5 rounded-full transition-all duration-500 ${item.total_done === item.sessions_status.length ? 'bg-green-500' : 'bg-[#0077AF]'}`}
                                        style={{ width: `${(item.total_done / item.sessions_status.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    )
}