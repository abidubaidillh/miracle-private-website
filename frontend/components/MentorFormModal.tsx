"use client"

import React, { useEffect, useState } from "react"
import { X, Save } from "lucide-react" // Hapus Loader2 karena sudah ada screen full
import { createMentor, updateMentor, Mentor } from "@/lib/mentorActions"
import { getUserRole } from "@/lib/auth"
import { useLoading } from "@/context/LoadingContext" // ✅ 1. Import Hook

interface Props {
  isOpen: boolean
  onClose: () => void
  editingMentor: Mentor | null
  onSuccess: () => void
}

const Input = ({ label, error, ...props }: any) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold text-gray-700">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <input
      {...props}
      className={`border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-miracle-blue outline-none transition-all ${
        props.disabled ? "bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200" : "bg-white border-gray-300"
      }`}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
)

export default function MentorFormModal({
  isOpen,
  onClose,
  editingMentor,
  onSuccess,
}: Props) {
  const isEdit = !!editingMentor
  const { withLoading } = useLoading() // ✅ 2. Gunakan Hook
  const [role, setRole] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    expertise: "",
    salary_per_session: "",
    status: "AKTIF",
  })

  useEffect(() => {
    setRole(getUserRole())
  }, [isOpen])

  useEffect(() => {
    if (editingMentor) {
      setForm({
        name: editingMentor.name,
        phone_number: editingMentor.phone_number,
        expertise: editingMentor.expertise || "",
        salary_per_session: String(editingMentor.salary_per_session),
        status: editingMentor.status,
      })
    } else {
      setForm({
        name: "",
        phone_number: "",
        expertise: "",
        salary_per_session: "",
        status: "AKTIF",
      })
    }
  }, [editingMentor, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // ✅ 3. Bungkus Logika Simpan dengan withLoading()
    await withLoading(async () => {
        try {
            const payload: any = {
                name: form.name,
                phone_number: form.phone_number,
                expertise: form.expertise,
                status: form.status,
            }

            if (role === "OWNER") {
                payload.salary_per_session = Number(form.salary_per_session)
            } else {
                if (!isEdit) payload.salary_per_session = 0
            }

            if (isEdit && editingMentor) {
                await updateMentor(editingMentor.id, payload)
            } else {
                await createMentor(payload)
            }

            onSuccess()
            onClose()
        } catch (error) {
            console.error(error)
            alert("Gagal menyimpan data mentor.")
        }
    })
  }

  if (!isOpen) return null

  const isOwner = role === "OWNER"
  const isAdmin = role === "ADMIN"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-xl text-gray-800">
            {isEdit ? "Edit Data Mentor" : "Tambah Mentor Baru"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap"
            required
            value={form.name}
            onChange={(e: any) => setForm({ ...form, name: e.target.value })}
            placeholder="Contoh: Budi Santoso"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="No. WhatsApp"
              required
              value={form.phone_number}
              onChange={(e: any) => setForm({ ...form, phone_number: e.target.value })}
              placeholder="08..."
            />
             <Input
                label="Bidang Keahlian"
                value={form.expertise}
                onChange={(e: any) => setForm({ ...form, expertise: e.target.value })}
                placeholder="Matematika, Fisika"
            />
          </div>

          <div>
             <div className="flex justify-between">
                <label className="text-sm font-semibold text-gray-700">Gaji Per Sesi (Rp)</label>
                {isAdmin && <span className="text-xs text-orange-500 italic">*Admin: Hanya Lihat</span>}
                {!isOwner && !isAdmin && <span className="text-xs text-red-500 italic">*Hanya Owner</span>}
             </div>
             <input
                type="number"
                className={`w-full border rounded-lg px-4 py-2 text-sm mt-1 font-mono ${
                    !isOwner 
                        ? "bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200" 
                        : "bg-white border-gray-300"
                }`}
                value={form.salary_per_session}
                onChange={(e) => setForm({ ...form, salary_per_session: e.target.value })}
                disabled={!isOwner}
                placeholder={!isOwner ? "0" : "Masukkan gaji..."}
             />
          </div>

          <div className="flex flex-col gap-1">
             <label className="text-sm font-semibold text-gray-700">Status</label>
             <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="border rounded-lg px-4 py-2 w-full text-sm bg-white"
             >
                <option value="AKTIF">✅ AKTIF</option>
                <option value="CUTI">⏸️ CUTI</option>
                <option value="NON-AKTIF">❌ NON-AKTIF</option>
             </select>
          </div>

          <button
            type="submit"
            // Tidak perlu disabled={loading} karena layar sudah ditutup loading screen
            className="w-full bg-miracle-blue hover:bg-miracle-dark text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition-colors mt-4"
          >
            <Save size={18} />
            Simpan Data
          </button>
        </form>
      </div>
    </div>
  )
}