// frontend/components/JadwalFormModal.tsx
"use client"
import React, { useState, useEffect } from "react"
import { X, Save } from "lucide-react"
import { createSchedule, getStudentsList, getMentorsList } from "@/lib/jadwalActions"
import { useLoading } from '@/context/LoadingContext'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function JadwalFormModal({ isOpen, onClose, onSuccess }: Props) {
  const { withLoading } = useLoading()
  const [students, setStudents] = useState<any[]>([])
  const [mentors, setMentors] = useState<any[]>([])

  const [form, setForm] = useState({
    student_id: "",
    mentor_id: "",
    date: new Date().toISOString().split('T')[0],
    start_time: "16:00",
    end_time: "17:30",
    subject: "",
    planned_sessions: 4 // Default target sesi per bulan
  })

  // Fetch data dropdown
  useEffect(() => {
    if (isOpen) {
      // Tidak perlu blocking loading screen untuk dropdown agar UX lebih cepat
      Promise.all([getStudentsList(), getMentorsList()])
        .then(([sData, mData]) => {
          setStudents(sData);
          setMentors(mData);
        })
        .catch(err => console.error("Gagal load dropdown", err));
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await withLoading(async () => {
        try {
            await createSchedule(form);
            onSuccess();
            onClose();
            // Reset form
            setForm({ ...form, subject: "", student_id: "", mentor_id: "" }); 
        } catch (error: any) {
            alert(error.message || "Gagal menyimpan jadwal.");
        }
    })
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="font-bold text-xl text-[#0077AF]">Buat Jadwal Sesi Baru</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X className="text-gray-500 hover:text-red-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                {/* Dropdown Murid */}
                <div>
                    <label className="block text-sm font-semibold mb-1">Murid</label>
                    <select 
                        className="w-full border rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0077AF] outline-none"
                        required
                        value={form.student_id}
                        onChange={e => setForm({...form, student_id: e.target.value})}
                    >
                        <option value="">-- Pilih Murid --</option>
                        {students.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                {/* Dropdown Mentor */}
                <div>
                    <label className="block text-sm font-semibold mb-1">Mentor</label>
                    <select 
                        className="w-full border rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0077AF] outline-none"
                        required
                        value={form.mentor_id}
                        onChange={e => setForm({...form, mentor_id: e.target.value})}
                    >
                        <option value="">-- Pilih Mentor --</option>
                        {mentors.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold mb-1">Tanggal Sesi</label>
                    <input 
                        type="date"
                        className="w-full border rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0077AF] outline-none"
                        required
                        value={form.date}
                        onChange={e => setForm({...form, date: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1">Mata Pelajaran</label>
                    <input 
                        className="w-full border rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0077AF] outline-none"
                        placeholder="Cth: Matematika"
                        value={form.subject}
                        onChange={e => setForm({...form, subject: e.target.value})}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold mb-1">Jam Mulai</label>
                    <input type="time" className="w-full border rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0077AF] outline-none" required 
                        value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1">Jam Selesai</label>
                    <input type="time" className="w-full border rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0077AF] outline-none" required 
                        value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} />
                </div>
            </div>

            {/* Input Target Sesi (Penting untuk Gaji) */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center justify-between">
                <div>
                    <label className="block text-sm font-bold text-gray-700">Target Pertemuan Bulan Ini</label>
                    <p className="text-xs text-gray-500">Mempengaruhi hitungan gaji mentor</p>
                </div>
                <div className="flex items-center gap-2">
                    <input 
                        type="number" 
                        min="1" 
                        max="31"
                        className="w-16 text-center border rounded-lg p-2 font-bold focus:ring-2 focus:ring-[#0077AF] outline-none"
                        value={form.planned_sessions}
                        onChange={e => setForm({...form, planned_sessions: parseInt(e.target.value) || 0})}
                    />
                    <span className="text-sm font-medium">Sesi</span>
                </div>
            </div>

            <button type="submit" className="w-full bg-[#0077AF] text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-[#006699] transition-all shadow-md mt-2">
                <Save size={18} /> Simpan Jadwal
            </button>
        </form>
      </div>
    </div>
  )
}