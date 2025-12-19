"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { useLoading } from '@/context/LoadingContext'
import { getMentorProfile, MentorProfile } from '@/lib/mentorActions'
import { User, Phone, Mail, BookOpen, Calendar, DollarSign, Clock, ArrowRight } from 'lucide-react'

// Helper Format Rupiah
const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

// Helper Format Tanggal Indonesia
const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
}

// 🔥 HELPER FORMAT JAM MENGGUNAKAN start_time 🔥
const formatTimeDisplay = (schedule: any) => {
    // Format yang diharapkan dari DB: "10:00:00"
    
    if (schedule.start_time) {
        // Ambil 5 karakter pertama (10:00)
        const start = schedule.start_time.substring(0, 5);
        
        // Opsional: Jika ada end_time, tampilkan juga (10:00 - 12:00)
        if (schedule.end_time) {
            const end = schedule.end_time.substring(0, 5);
            return `${start} - ${end}`;
        }
        
        return start;
    }

    return '00:00';
}

export default function MentorProfilePage() {
    const { withLoading } = useLoading()
    const [profile, setProfile] = useState<MentorProfile | null>(null)

    useEffect(() => {
        const fetchProfile = async () => {
            await withLoading(async () => {
                try {
                    const data = await getMentorProfile()
                    setProfile(data)
                } catch (err) {
                    console.error("Gagal ambil profil:", err)
                }
            })
        }
        fetchProfile()
    }, [])

    if (!profile) return null

    const { mentor, stats, upcoming_schedules } = profile

    return (
        <DashboardLayout title="Profil Saya">
            
            {/* HEADER PROFILE */}
            <div className="bg-gradient-to-r from-[#0077AF] to-[#005f8c] rounded-2xl p-6 text-white shadow-lg mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/30 text-white shadow-inner shrink-0">
                    <User size={48} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold mb-1">{mentor.name}</h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm font-medium text-blue-100">
                        <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full"><Mail size={14}/> {mentor.email}</span>
                        <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full"><Phone size={14}/> {mentor.phone_number}</span>
                        <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full"><BookOpen size={14}/> {mentor.subject || 'Umum'}</span>
                    </div>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg border border-white/30 text-center min-w-[120px]">
                    <p className="text-xs uppercase tracking-widest opacity-80">Status</p>
                    <p className="text-lg font-bold">{mentor.status}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* KOLOM KIRI: INFO */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2">
                            <DollarSign size={16} className="text-green-600"/> Informasi Gaji
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                <p className="text-xs text-gray-500 mb-1">Fee Per Sesi</p>
                                <p className="text-2xl font-black text-green-700 font-mono">{formatRupiah(mentor.salary_per_session)}</p>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-dashed pb-2">
                                <span className="text-gray-600">Total Sesi Bulan Ini</span>
                                <span className="font-bold">{stats.sessions_this_month} Sesi</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Estimasi Pendapatan</span>
                                <span className="font-bold text-[#0077AF]">{formatRupiah(stats.sessions_this_month * mentor.salary_per_session)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2">
                            <User size={16} className="text-[#0077AF]"/> Detail Akun
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex justify-between">
                                <span className="text-gray-500">ID Mentor</span>
                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{mentor.id.substring(0, 8)}...</span>
                            </li>
                            <li className="flex justify-between">
                                <span className="text-gray-500">Keahlian</span>
                                <span className="font-semibold text-gray-800 text-right">{mentor.subject || '-'}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* KOLOM KANAN: JADWAL */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Calendar size={18} className="text-[#0077AF]"/> Jadwal Mengajar
                            </h3>
                            <Link href="/jadwal" className="text-xs bg-white border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg font-bold text-[#0077AF] transition flex items-center gap-1">
                                Lihat Semua <ArrowRight size={12}/>
                            </Link>
                        </div>
                        
                        <div className="flex-1 p-0">
                            {!upcoming_schedules || upcoming_schedules.length === 0 ? (
                                <div className="flex flex-col items-center justify-center text-center h-64 p-6">
                                    <div className="bg-blue-50 rounded-full p-4 mb-3">
                                        <Clock size={32} className="text-blue-400" />
                                    </div>
                                    <h4 className="text-gray-800 font-bold mb-1">Tidak Ada Jadwal</h4>
                                    <p className="text-sm text-gray-500 max-w-xs">
                                        Jadwal mengajar akan muncul di sini.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {upcoming_schedules.map((schedule: any) => (
                                        <div key={schedule.id} className="p-4 hover:bg-blue-50/30 transition-colors flex items-center gap-4 group">
                                            
                                            {/* Tanggal Box */}
                                            <div className="flex flex-col items-center justify-center bg-blue-50 text-[#0077AF] rounded-lg w-16 h-16 shrink-0 border border-blue-100">
                                                <span className="text-xs font-bold uppercase">{new Date(schedule.date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                                                <span className="text-2xl font-black">{new Date(schedule.date).getDate()}</span>
                                            </div>

                                            {/* Detail Jadwal */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-800 truncate flex items-center gap-2">
                                                    {schedule.subject || 'Private Class'}
                                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border">
                                                        {schedule.students?.name || 'Murid'}
                                                    </span>
                                                </h4>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                    
                                                    {/* 🔥 JAM DIAMBIL LANGSUNG DARI start_time & end_time */}
                                                    <span className="flex items-center gap-1 font-mono font-bold text-[#0077AF]">
                                                        <Clock size={14} className="text-gray-400"/> 
                                                        {formatTimeDisplay(schedule)} WIB
                                                    </span>
                                                    
                                                    <span className="hidden sm:flex items-center gap-1">
                                                        <Calendar size={14} className="text-gray-400"/> {formatDate(schedule.date)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    )
}