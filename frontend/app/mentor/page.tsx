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
import { getUserRole } from "@/lib/auth" 

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

  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const currentRole = getUserRole()
    setRole(currentRole)
  }, [])

  const fetchMentors = async () => {
    setLoading(true)
    try {
      const result = await getMentors()
      const allMentors = result.mentors || []
      
      const filtered = searchQuery
        ? allMentors.filter(
            (m: Mentor) =>
              m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              m.phone_number.includes(searchQuery)
          )
        : allMentors

      setMentorData(filtered)
      if (result.stats) {
          setActiveCount(result.stats.active || 0)
          setInactiveCount(result.stats.inactive || 0)
      }
    } catch (err) {
      console.error("[MentorPage] Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchMentors()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus mentor ${name}?`)) return
    await deleteMentor(id)
    fetchMentors()
  }

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num)
  }

  // --- LOGIKA HAK AKSES BARU ---
  const isOwner = role === "OWNER"
  const isAdmin = role === "ADMIN"
  
  // ✅ PERUBAHAN DI SINI: Admin juga boleh melihat (canView)
  const canViewSalary = isOwner || isAdmin 
  
  // Admin boleh edit data lain, tapi TIDAK boleh edit gaji (logic di Modal)
  const canEditInfo = isOwner || isAdmin 

  return (
    <DashboardLayout title="Data Mentor">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex gap-4">
          <StatPill icon={Briefcase} label="Aktif" count={activeCount} colorClass="bg-[#5AB267]" />
          <StatPill icon={Briefcase} label="Non-Aktif" count={inactiveCount} colorClass="bg-[#FF0000]" />
        </div>

        {canEditInfo && (
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

      <div className="mb-6 w-full max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari nama atau no HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#F0F2F5] text-gray-700 font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-[#0077AF] border border-gray-200"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-[#0077AF] text-white">
                <tr>
                {["Nama", "No HP", "Bidang", "Status", canViewSalary ? "Gaji / Sesi" : "", canEditInfo ? "Aksi" : ""].map(
                    (h, i) => (
                    h !== "" && <th key={i} className="px-6 py-4 text-sm font-bold whitespace-nowrap">
                        {h}
                    </th>
                    )
                )}
                </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
                {loading ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2" />Memuat data...</td></tr>
                ) : mentorData.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-400">Data tidak ditemukan</td></tr>
                ) : (
                mentorData.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{m.name}</td>
                    <td className="px-6 py-4 text-gray-600">{m.phone_number}</td>
                    <td className="px-6 py-4 text-gray-600">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold border border-blue-100">
                            {m.expertise || "-"}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold text-white ${m.status === "AKTIF" ? "bg-[#5AB267]" : "bg-[#FF0000]"}`}>
                        {m.status}
                        </span>
                    </td>

                    {/* ✅ LOGIKA BARU: Owner & Admin bisa melihat Gaji */}
                    {canViewSalary && (
                        <td className="px-6 py-4 font-mono text-sm">
                            <span className="text-[#0077AF] font-bold">
                                {formatRupiah(m.salary_per_session || 0)}
                            </span>
                        </td>
                    )}

                    {canEditInfo && (
                        <td className="px-6 py-4 flex gap-3">
                        <button
                            onClick={() => {
                                setEditingMentor(m)
                                setIsModalOpen(true)
                            }}
                            className="text-yellow-600 hover:text-yellow-700 p-2 hover:bg-yellow-50 rounded transition"
                            title="Edit"
                        >
                            <Pencil size={18} />
                        </button>
                        {isOwner && (
                            <button
                            onClick={() => handleDelete(m.id, m.name)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition"
                            title="Hapus"
                            >
                            <Trash2 size={18} />
                            </button>
                        )}
                        </td>
                    )}
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
      </div>

      <MentorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingMentor={editingMentor}
        onSuccess={fetchMentors}
      />
    </DashboardLayout>
  )
}