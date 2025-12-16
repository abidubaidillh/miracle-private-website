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

  const [form, setForm] = useState({
    student_id: "",
    mentor_id: "",
    day_of_week: "SENIN",
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
        await createSchedule(form);
        onSuccess();
        onClose();
        setForm({ ...form, subject: "" }); // Reset sebagian
    } catch (error: any) { // ✅ Tambahkan tipe any agar properti message terbaca
        console.error(error);
        // ✅ PERBAIKAN UTAMA DI SINI: Tampilkan pesan spesifik dari error object
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
          <h2 className="font-bold text-xl">Buat Jadwal Baru</h2>
          <button onClick={onClose}><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dropdown Murid */}
            <div>
                <label className="block text-sm font-semibold mb-1">Murid</label>
                <select 
                    className="w-full border rounded-lg p-2"
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
                    className="w-full border rounded-lg p-2"
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

            {/* Hari & Mapel */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold mb-1">Hari</label>
                    <select 
                        className="w-full border rounded-lg p-2"
                        value={form.day_of_week}
                        onChange={e => setForm({...form, day_of_week: e.target.value})}
                    >
                        {["SENIN","SELASA","RABU","KAMIS","JUMAT","SABTU","MINGGU"].map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1">Mata Pelajaran</label>
                    <input 
                        className="w-full border rounded-lg p-2"
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
                    <input type="time" className="w-full border rounded-lg p-2" required 
                        value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1">Jam Selesai</label>
                    <input type="time" className="w-full border rounded-lg p-2" required 
                        value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} />
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#0077AF] text-white py-2 rounded-lg font-bold flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                Simpan Jadwal
            </button>
        </form>
      </div>
    </div>
  )
}