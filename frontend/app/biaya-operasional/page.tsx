// frontend/app/absensi/page.tsx
"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { getSchedules } from '@/lib/jadwalActions'
import { getAttendance, submitAttendance } from '@/lib/absensiActions'
import Swal from 'sweetalert2'
import { useLoading } from '@/context/LoadingContext'
import { Calendar, User, BookOpen, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

// Helper UI
const getDayName = (dateStr: string) => {
  const date = new Date(dateStr);
  const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
  return days[date.getDay()];
};

export default function AbsensiPage() {
  const { withLoading } = useLoading()

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [existingAttendance, setExistingAttendance] = useState<any[]>([]);

  // Load Data
  const fetchData = async () => {
    await withLoading(async () => {
        try {
            // Ambil jadwal sesi pada tanggal yang dipilih
            const jadwalData = await getSchedules({ date: selectedDate });
            // Ambil data absensi yang SUDAH TERCATAT pada tanggal tersebut
            const absensiData = await getAttendance({ date: selectedDate });

            setSchedules(jadwalData.schedules || []);
            setExistingAttendance(absensiData.attendance || []);
        } catch (error: any) {
            console.error(error);
            if (error.message !== 'SESSION_EXPIRED') {
                Swal.fire('Error', 'Gagal memuat data. Cek koneksi server.', 'error');
            }
        }
    });
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  // Handle Submit Absensi
  const handleAbsen = async (scheduleId: string, status: string) => {
    await withLoading(async () => {
        try {
            await submitAttendance({
                schedule_id: scheduleId,
                date: selectedDate,
                status: status,
                notes: '-'
            });
            
            // Refresh data lokal tanpa fetch ulang full (Optimistic UI update possible, tapi fetch lebih aman)
            const updatedAbsensi = await getAttendance({ date: selectedDate });
            setExistingAttendance(updatedAbsensi.attendance || []);
            
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true
            });
            
            Toast.fire({
                icon: 'success',
                title: `Status: ${status} tersimpan`
            });

        } catch (error: any) {
            Swal.fire('Gagal', error.message, 'error');
        }
    });
  };

  // Helper untuk cek status saat ini
  const getStatus = (scheduleId: string) => {
    const record = existingAttendance.find((a) => a.schedule_id === scheduleId);
    return record ? record.status : null; // Return 'Hadir', 'Izin', 'Alpa', atau null
  };

  return (
    <DashboardLayout title="Absensi Harian">
      
        {/* Filter Tanggal */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-wrap items-center gap-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Pilih Tanggal</label>
                <div className="flex items-center gap-2 border p-2 rounded-lg focus-within:ring-2 focus-within:ring-[#0077AF] transition-all">
                    <Calendar size={20} className="text-[#0077AF]" />
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="outline-none bg-transparent font-medium text-gray-700"
                    />
                </div>
            </div>
            <div className="mt-6">
                <span className="font-bold text-[#0077AF] bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 uppercase tracking-wider text-sm">
                    Hari: {getDayName(selectedDate)}
                </span>
            </div>
        </div>

        {/* Daftar Kelas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <BookOpen size={18} /> Jadwal Kelas Hari Ini
                </h3>
            </div>
            
            {schedules.length === 0 ? (
                <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                    <Calendar size={48} className="mb-4 opacity-30" />
                    <p className="font-medium">Tidak ada jadwal kelas untuk tanggal ini.</p>
                    <p className="text-sm mt-1">Silakan pilih tanggal lain atau buat jadwal baru.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-700 border-b">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Jam</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Mapel</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Murid</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Mentor</th>
                                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Status Kehadiran</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {schedules.map((schedule) => {
                                const currentStatus = getStatus(schedule.id);
                                return (
                                    <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700 flex items-center gap-2">
                                            <Clock size={16} className="text-[#0077AF]"/>
                                            {schedule.start_time.slice(0,5)} - {schedule.end_time.slice(0,5)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {schedule.subject}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {schedule.students?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center gap-2">
                                            <User size={16} className="text-gray-400"/>
                                            {schedule.mentors?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleAbsen(schedule.id, 'HADIR')} // Pastikan string 'HADIR' sesuai enum DB (Case Sensitive biasanya diabaikan di controller tapi konsistensi penting)
                                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                        currentStatus === 'HADIR' 
                                                        ? 'bg-green-600 text-white border-green-600 shadow-md scale-105' 
                                                        : 'bg-white text-gray-500 border-gray-200 hover:border-green-500 hover:text-green-600'
                                                    }`}
                                                >
                                                    <CheckCircle size={14} /> Hadir
                                                </button>
                                                <button
                                                    onClick={() => handleAbsen(schedule.id, 'IZIN')}
                                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                        currentStatus === 'IZIN' 
                                                        ? 'bg-yellow-500 text-white border-yellow-500 shadow-md scale-105' 
                                                        : 'bg-white text-gray-500 border-gray-200 hover:border-yellow-500 hover:text-yellow-600'
                                                    }`}
                                                >
                                                    <AlertCircle size={14} /> Izin
                                                </button>
                                                <button
                                                    onClick={() => handleAbsen(schedule.id, 'ALPA')}
                                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                        currentStatus === 'ALPA' 
                                                        ? 'bg-red-600 text-white border-red-600 shadow-md scale-105' 
                                                        : 'bg-white text-gray-500 border-gray-200 hover:border-red-500 hover:text-red-600'
                                                    }`}
                                                >
                                                    <XCircle size={14} /> Alpa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </DashboardLayout>
  )
}