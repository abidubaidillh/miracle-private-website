"use client"

import React, { useEffect, useState } from "react"
import { X, Plus } from "lucide-react"
import { createMentor, updateMentor, Mentor } from "@/lib/mentorActions"

interface Props {
  isOpen: boolean
  onClose: () => void
  editingMentor: Mentor | null
  onSuccess: () => void
}

/**
 * ⬇️ SIMULASI USER ROLE
 * GANTI dengan auth asli (useAuth / useSession)
 */
const user = {
  role: "ADMIN", // OWNER | ADMIN | BENDAHARA | MENTOR
}

const Input = ({ label, ...props }: any) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold">{label}</label>
    <input
      {...props}
      className={`border rounded-lg px-4 py-2 text-sm ${
        props.disabled ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
    />
  </div>
)

export default function MentorFormModal({
  isOpen,
  onClose,
  editingMentor,
  onSuccess,
}: Props) {
  const isEdit = !!editingMentor

  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    expertise: "",
    salary_per_session: "",
    status: "AKTIF",
  })

  useEffect(() => {
    if (editingMentor) {
      setForm({
        name: editingMentor.name,
        phone_number: editingMentor.phone_number,
        expertise: editingMentor.expertise || "",
        salary_per_session: String(editingMentor.salary_per_session),
        status: editingMentor.status,
      })
    }
  }, [editingMentor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload: any = {
      name: form.name,
      phone_number: form.phone_number,
      expertise: form.expertise,
      status: form.status,
    }

    /**
     * 🔐 ADMIN TIDAK BOLEH KIRIM GAJI
     */
    if (user.role !== "ADMIN") {
      payload.salary_per_session = Number(form.salary_per_session)
    }

    if (isEdit && editingMentor) {
      await updateMentor(editingMentor.id, payload)
    } else {
      payload.salary_per_session = Number(form.salary_per_session)
      await createMentor(payload)
    }

    onSuccess()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">
            {isEdit ? "Edit Mentor" : "Tambah Mentor"}
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama"
            value={form.name}
            onChange={(e: any) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <Input
            label="No HP"
            value={form.phone_number}
            onChange={(e: any) =>
              setForm({ ...form, phone_number: e.target.value })
            }
          />

          <Input
            label="Bidang"
            value={form.expertise}
            onChange={(e: any) =>
              setForm({ ...form, expertise: e.target.value })
            }
          />

          {/* 🔐 Gaji */}
          <Input
            label="Gaji per Sesi"
            type="number"
            value={form.salary_per_session}
            disabled={user.role === "ADMIN"}
            onChange={(e: any) =>
              setForm({ ...form, salary_per_session: e.target.value })
            }
          />

          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value })
            }
            className="border rounded-lg px-4 py-2 w-full"
          >
            <option value="AKTIF">AKTIF</option>
            <option value="NON-AKTIF">NON-AKTIF</option>
          </select>

          <button
            type="submit"
            className="w-full bg-[#00558F] text-white py-2 rounded-lg font-bold"
          >
            <Plus size={16} className="inline mr-2" />
            Simpan
          </button>
        </form>
      </div>
    </div>
  )
}