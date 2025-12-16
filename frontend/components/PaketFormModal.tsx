"use client"

import React, { useEffect, useState } from "react"
import { X, Plus, Save } from "lucide-react"
import { createPackage, updatePackage, Package } from "@/lib/packageActions"

interface Props {
  isOpen: boolean
  onClose: () => void
  editingPackage: Package | null
  onSuccess: () => void
}

const Input = ({ label, ...props }: any) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold">{label}</label>
    <input
      {...props}
      className="border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#00558F] outline-none transition"
    />
  </div>
)

export default function PaketFormModal({
  isOpen,
  onClose,
  editingPackage,
  onSuccess,
}: Props) {
  const isEdit = !!editingPackage

  const [form, setForm] = useState({
    name: "",
    duration: "",
    price: "",
    description: "",
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (editingPackage) {
      setForm({
        name: editingPackage.name,
        duration: editingPackage.duration,
        price: String(editingPackage.price),
        description: editingPackage.description || "",
      })
    } else {
      setForm({ name: "", duration: "", price: "", description: "" })
    }
  }, [editingPackage, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        name: form.name,
        duration: form.duration,
        price: Number(form.price),
        description: form.description
      }

      if (isEdit && editingPackage) {
        await updatePackage(editingPackage.id, payload)
      } else {
        await createPackage(payload)
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error(error)
      alert("Gagal menyimpan data.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl transform transition-all scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-xl text-gray-800">
            {isEdit ? "Edit Paket Kelas" : "Tambah Paket Baru"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Paket"
            placeholder="Contoh: Paket SD Intensif"
            value={form.name}
            onChange={(e: any) => setForm({ ...form, name: e.target.value })}
            required
          />

          <Input
            label="Durasi / Jumlah Sesi"
            placeholder="Contoh: 1 Bulan (8 Sesi) atau 90 Menit"
            value={form.duration}
            onChange={(e: any) => setForm({ ...form, duration: e.target.value })}
            required
          />

          <Input
            label="Harga (Rp)"
            type="number"
            placeholder="Contoh: 500000"
            value={form.price}
            onChange={(e: any) => setForm({ ...form, price: e.target.value })}
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Keterangan (Opsional)</label>
            <textarea
              className="border rounded-lg px-4 py-2 text-sm h-24 resize-none focus:ring-2 focus:ring-[#00558F] outline-none"
              placeholder="Detail tambahan tentang paket..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="pt-2">
             <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#00558F] hover:bg-[#004475] text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
            >
                {isLoading ? (
                    <span>Menyimpan...</span>
                ) : (
                    <>
                        {isEdit ? <Save size={18} /> : <Plus size={18} />}
                        {isEdit ? "Simpan Perubahan" : "Buat Paket"}
                    </>
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}