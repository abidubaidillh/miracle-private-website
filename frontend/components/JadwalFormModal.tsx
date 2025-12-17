// frontend/components/JadwalFormModal.tsx
"use client"
import React, { useState, useEffect } from "react"
import { X, Save, Loader2 } from "lucide-react"
import { createSchedule, getStudentsList, getMentorsList } from "@/lib/jadwalActions"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function JadwalFormModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [mentors, setMentors] = useState<any[]>([])

  // ✅ STATE UPDATE: Mengganti 'day_of_week' menjadi 'date'
  // Default tanggal diisi hari ini
  const [form, setForm] = useState({
    student_id: "",
    mentor_id: "",
    date: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
    start_time: "16:00",
    end_time: "17:30",
    subject: ""
  })

  // Fetch data dropdown saat modal dibuka
  useEffect(() => {
    if (isOpen) {
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
    setLoading(true);
    try {
        // Form otomatis mengirim { date: "..." } sesuai backend
        await createSchedule(form);
        onSuccess();
        onClose();
        // Reset form (tetap pertahankan tanggal hari ini untuk input selanjutnya)
        setForm({ ...form, subject: "" }); 
    } catch (error: any) {
        console.error(error);
        alert(error.message || "Gagal menyimpan jadwal.");
    } finally {
        setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-xl">Buat Jadwal Sesi Baru</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dropdown Murid */}
            <div>
                <label className="block text-sm font-semibold mb-1">Murid</label>
                <select 
                    className="w-full border rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
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
                    className="w-full border rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                    value={form.mentor_id}
                    onChange={e => setForm({...form, mentor_id: e.target.value})}
                >
                    <option value="">-- Pilih Mentor --</option>
                    {mentors.map(m => (
                        <option key={m.id} value={m.id}>
                            {m.name || m.username} {m.email ? `(${m.email})` : ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* ✅ UI UPDATE: Tanggal & Mapel */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold mb-1">Tanggal</label>
                    <input 
                        type="date"
                        className="w-full border rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                        value={form.date}
                        onChange={e => setForm({...form, date: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1">Mata Pelajaran</label>
                    <input 
                        className="w-full border rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Cth: Matematika"
                        value={form.subject}
                        onChange={e => setForm({...form, subject: e.target.value})}
                    />
                </div>
            </div>

            {/* Waktu */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold mb-1">Jam Mulai</label>
                    <input type="time" className="w-full border rounded-lg p-2 bg-gray-50 focus:bg-white outline-none" required 
                        value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1">Jam Selesai</label>
                    <input type="time" className="w-full border rounded-lg p-2 bg-gray-50 focus:bg-white outline-none" required 
                        value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} />
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#0077AF] text-white py-2 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-[#006699] transition-colors">
                {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                Simpan Jadwal
            </button>
        </form>
      </div>
    </div>
  )
}