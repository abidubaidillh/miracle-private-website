"use client"

import React, { useEffect, useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import {
  Search,
  UserPlus,
  Pencil,
  Trash2,
  Loader2,
  Briefcase,
} from "lucide-react"
import MentorFormModal from "@/components/MentorFormModal"
import { getMentors, deleteMentor, Mentor } from "@/lib/mentorActions"

/**
 * 🔐 SIMULASI USER
 * GANTI dengan useAuth / useSession di tahap selanjutnya
 */
const user = {
  role: "ADMIN", // OWNER | ADMIN | BENDAHARA | MENTOR
}

// ======================================================
// Komponen Statistik Pill
// ======================================================
const StatPill = ({ icon: Icon, count, label, colorClass }: any) => (
  <div
    className={`flex items-center px-5 py-2 rounded-full text-white text-sm font-bold shadow-sm ${colorClass}`}
  >
    <Icon size={18} className="mr-2" />
    <span>
      {label}: {count}
    </span>
  </div>
)

export default function MentorPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [mentorData, setMentorData] = useState<Mentor[]>([])
  const [activeCount, setActiveCount] = useState(0)
  const [inactiveCount, setInactiveCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null)

  // ======================================================
  // Fetch Data Mentor
  // ======================================================
  const fetchMentors = async () => {
    setLoading(true)
    try {
      const result = await getMentors()

      const filtered = searchQuery
        ? result.mentors.filter(
            (m) =>
              m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              m.phone_number.includes(searchQuery)
          )
        : result.mentors

      setMentorData(filtered)
      setActiveCount(result.activeCount)
      setInactiveCount(result.inactiveCount)
    } catch (err) {
      console.error("[MentorPage] Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMentors()
  }, [searchQuery])

  // ======================================================
  // Delete Mentor (OWNER ONLY — UI Guard)
  // ======================================================
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus mentor ${name}?`)) return
    await deleteMentor(id)
    fetchMentors()
  }

  return (
    <DashboardLayout title="Data Mentor">
      {/* ================================================== */}
      {/* TOP BAR */}
      {/* ================================================== */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-4">
          <StatPill
            icon={Briefcase}
            label="Mentor Aktif"
            count={activeCount}
            colorClass="bg-[#5AB267]"
          />
          <StatPill
            icon={Briefcase}
            label="Mentor Non-Aktif"
            count={inactiveCount}
            colorClass="bg-[#FF0000]"
          />
        </div>

        {/* 🔐 Tambah Mentor: OWNER & ADMIN */}
        {(user.role === "OWNER" || user.role === "ADMIN") && (
          <button
            onClick={() => {
              setEditingMentor(null)
              setIsModalOpen(true)
            }}
            className="flex items-center px-6 py-2.5 bg-[#00558F] text-white rounded-lg font-bold text-sm hover:bg-[#004475] transition shadow-md"
          >
            <UserPlus size={18} className="mr-2" />
            Tambah Mentor
          </button>
        )}
      </div>

      {/* ================================================== */}
      {/* SEARCH */}
      {/* ================================================== */}
      <div className="mb-6 w-full max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari Mentor"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#CFCFCF] text-gray-700 font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-[#0077AF] placeholder-white"
          />
          <Search className="absolute left-4 top-3.5 text-white" size={20} />
        </div>
      </div>

      {/* ================================================== */}
      {/* TABLE */}
      {/* ================================================== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#0077AF] text-white">
            <tr>
              {["Nama", "No HP", "Bidang", "Gaji / Sesi", "Status", "Aksi"].map(
                (h) => (
                  <th key={h} className="px-6 py-4 text-sm font-bold">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-500">
                  <Loader2 className="animate-spin inline mr-2" />
                  Memuat data...
                </td>
              </tr>
            ) : mentorData.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-400">
                  Data tidak ditemukan
                </td>
              </tr>
            ) : (
              mentorData.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">{m.name}</td>
                  <td className="px-6 py-4">{m.phone_number}</td>
                  <td className="px-6 py-4">{m.expertise || "-"}</td>

                  {/* 🔐 Gaji */}
                  <td className="px-6 py-4">
                    {user.role === "OWNER" || user.role === "BENDAHARA"
                      ? `Rp ${m.salary_per_session.toLocaleString("id-ID")}`
                      : "—"}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-4 py-1 rounded-full text-[11px] font-bold text-white ${
                        m.status === "AKTIF"
                          ? "bg-[#5AB267]"
                          : "bg-[#FF0000]"
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 flex gap-3">
                    {/* 🔐 EDIT: OWNER & ADMIN */}
                    {(user.role === "OWNER" || user.role === "ADMIN") && (
                      <button
                        onClick={() => {
                          setEditingMentor(m)
                          setIsModalOpen(true)
                        }}
                        className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                      >
                        <Pencil size={18} />
                      </button>
                    )}

                    {/* 🔐 DELETE: OWNER ONLY */}
                    {user.role === "OWNER" && (
                      <button
                        onClick={() => handleDelete(m.id, m.name)}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================================================== */}
      {/* MODAL */}
      {/* ================================================== */}
      <MentorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingMentor={editingMentor}
        onSuccess={fetchMentors}
      />
    </DashboardLayout>
  )
}