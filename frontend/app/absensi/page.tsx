"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { getSchedules } from '@/lib/jadwalActions'
import { getAttendance, submitAttendance } from '@/lib/absensiActions'
import Swal from 'sweetalert2'

// Helper: Hanya untuk tampilan UI (User Experience), tidak untuk API
const getDayName = (dateStr: string) => {
  const date = new Date(dateStr);
  const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
  return days[date.getDay()];
};

export default function AbsensiPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [existingAttendance, setExistingAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load Data
  const fetchData = async () => {
    setLoading(true);
    try {
      // ✅ LOGIKA BARU: Kirim langsung tanggal (YYYY-MM-DD) ke API Jadwal
      console.log(`Debug: Mengambil jadwal untuk TANGGAL: ${selectedDate}`);

      const jadwalData = await getSchedules({ date: selectedDate });
      
      const absensiData = await getAttendance({ date: selectedDate });

      setSchedules(jadwalData.schedules || []);
      setExistingAttendance(absensiData.attendance || []);
    } catch (error: any) {
      console.error(error);
      
      if (error.message === 'UNAUTHORIZED' || error.message.includes('401')) {
          Swal.fire({
              icon: 'warning',
              title: 'Sesi Berakhir',
              text: 'Silakan login kembali.',
              confirmButtonText: 'Login'
          }).then(() => {
              window.location.href = '/login';
          });
          return;
      }

      Swal.fire('Error', 'Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  // Handle Submit
  const handleAbsen = async (scheduleId: string, status: string) => {
    try {
      await submitAttendance({
        schedule_id: scheduleId,
        date: selectedDate,
        status: status,
        notes: '-'
      });
      
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
        title: `Absen ${status} berhasil disimpan`
      });

    } catch (error: any) {
      Swal.fire('Gagal', error.message, 'error');
    }
  };

  const getStatus = (scheduleId: string) => {
    const record = existingAttendance.find((a) => a.schedule_id === scheduleId);
    return record ? record.status : null;
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Absensi Kelas</h1>

        {/* Filter Tanggal */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Tanggal Absensi</label>
            <div className="flex items-center gap-4">
                <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border p-2 rounded-md w-full md:w-1/4"
                />
                {/* Menampilkan hari hanya sebagai info tambahan */}
                <span className="font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-md">
                    Hari: {getDayName(selectedDate)}
                </span>
            </div>
        </div>

        {/* Daftar Kelas Hari Ini */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">Jadwal Kelas</h3>
                <span className="text-sm text-gray-500">{selectedDate}</span>
            </div>
            
            {loading ? (
                <div className="p-8 text-center text-gray-500">Memuat data jadwal & absensi...</div>
            ) : schedules.length === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-yellow-50">
                    <p className="font-semibold">Tidak ada jadwal kelas untuk tanggal {selectedDate} ({getDayName(selectedDate)}).</p>
                    <p className="text-sm mt-2">Pastikan jadwal sesi sudah dibuat sebelumnya</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mapel</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Murid</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi Absensi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {schedules.map((schedule) => {
                                const currentStatus = getStatus(schedule.id);
                                return (
                                    <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                                            {schedule.start_time.slice(0,5)} - {schedule.end_time.slice(0,5)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {schedule.subject}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                            {schedule.students?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {schedule.mentors?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => handleAbsen(schedule.id, 'Hadir')}
                                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                                        currentStatus === 'Hadir' 
                                                        ? 'bg-green-600 text-white shadow-md scale-105' 
                                                        : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'
                                                    }`}
                                                >
                                                    Hadir
                                                </button>
                                                <button
                                                    onClick={() => handleAbsen(schedule.id, 'Izin')}
                                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                                        currentStatus === 'Izin' 
                                                        ? 'bg-yellow-500 text-white shadow-md scale-105' 
                                                        : 'bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-700'
                                                    }`}
                                                >
                                                    Izin
                                                </button>
                                                <button
                                                    onClick={() => handleAbsen(schedule.id, 'Alpa')}
                                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                                        currentStatus === 'Alpa' 
                                                        ? 'bg-red-600 text-white shadow-md scale-105' 
                                                        : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700'
                                                    }`}
                                                >
                                                    Alpa
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
      </div>
    </DashboardLayout>
  )
}