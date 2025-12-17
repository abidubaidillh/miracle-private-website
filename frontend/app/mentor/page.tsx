"use client"

import React, { useEffect, useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { Search, Pencil, Trash2, Briefcase, User } from "lucide-react"
import MentorFormModal from "@/components/MentorFormModal"
import { getMentors, deleteMentor, Mentor } from "@/lib/mentorActions"
import { useUser } from "@/context/UserContext"
import { useLoading } from "@/context/LoadingContext"

// Komponen Pill Statistik Kecil
const StatPill = ({ icon: Icon, count, label, colorClass }: any) => (
  <div className={`flex items-center px-4 py-2 rounded-lg text-white text-xs font-bold shadow-sm transition-transform hover:scale-105 ${colorClass}`}>
    <Icon size={16} className="mr-2" />
    <span>{label}: {count}</span>
  </div>
)

export default function MentorPage() {
  const { user } = useUser()
  const { withLoading } = useLoading()

  // State
  const [searchQuery, setSearchQuery] = useState("")
  const [mentorData, setMentorData] = useState<any[]>([]) // Pakai any agar fleksibel membaca subject/expertise
  const [activeCount, setActiveCount] = useState(0)
  const [inactiveCount, setInactiveCount] = useState(0)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null)

  // Role Check
  const role = user?.role || ''
  const isOwner = role === "OWNER"
  const isAdmin = role === "ADMIN"
  
  // Permission
  const canViewSalary = isOwner || isAdmin 
  const canEditInfo = isOwner || isAdmin 

  const fetchMentors = async () => {
    await withLoading(async () => {
      try {
        const result: any = await getMentors()
        const allMentors = result.mentors || []
        
        // Filter Frontend (Search)
        const query = searchQuery.toLowerCase()
        const filtered = searchQuery
          ? allMentors.filter((m: any) => {
              // Cek variabel subject/expertise agar pencarian bidang juga jalan
              const subject = m.subject || m.subjects || m.expertise || ''
              return (
                m.name.toLowerCase().includes(query) || 
                m.phone_number.includes(query) ||
                subject.toLowerCase().includes(query)
              )
            })
          : allMentors
        
        setMentorData(filtered)
        
        // Update Stats
        // Hitung manual dari data jika backend tidak kirim stats
        const active = allMentors.filter((m: any) => m.status === 'AKTIF').length
        const inactive = allMentors.filter((m: any) => m.status !== 'AKTIF').length
        
        setActiveCount(active)
        setInactiveCount(inactive)

      } catch (err) {
        console.error("Gagal mengambil data mentor:", err)
      }
    })
  }

  // Effect untuk inisialisasi dan debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMentors()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus mentor ${name}? Data jadwal & gaji terkait mungkin ikut terhapus.`)) return

    await withLoading(async () => {
      try {
        await deleteMentor(id)
        fetchMentors() // Refresh data
      } catch (err) {
        alert("Gagal menghapus mentor")
        console.error(err)
      }
    })
  }

  const formatRupiah = (num: number) => 
    new Intl.NumberFormat("id-ID", { 
      style: "currency", 
      currency: "IDR", 
      minimumFractionDigits: 0 
    }).format(num)

  return (
    <DashboardLayout title="Data Mentor">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        {/* Stats Pills */}
        <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          <StatPill icon={Briefcase} label="Total" count={activeCount + inactiveCount} colorClass="bg-gray-600" />
          <StatPill icon={User} label="Aktif" count={activeCount} colorClass="bg-[#5AB267]" />
          <StatPill icon={User} label="Non-Aktif" count={inactiveCount} colorClass="bg-[#FF0000]" />
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-80">
          <div className="relative group">
            <input
              type="text"
              placeholder="Cari Nama, HP, atau Bidang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0077AF] focus:border-transparent transition-all shadow-sm group-hover:border-gray-400"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 group-hover:text-[#0077AF] transition-colors" size={18} />
          </div>
        </div>
      </div>

      {/* Tabel Data Mentor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Nama Mentor</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Kontak</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Bidang Studi</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Status</th>
                {canViewSalary && (
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Gaji / Sesi</th>
                )}
                {canEditInfo && (
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mentorData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400 italic">
                    Belum ada data mentor yang sesuai.
                  </td>
                </tr>
              ) : (
                mentorData.map((m) => (
                  <tr key={m.id} className="hover:bg-blue-50/30 transition-colors group">
                    
                    {/* NAMA */}
                    <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{m.name}</div>
                        <div className="text-xs text-gray-400">{m.email}</div>
                    </td>

                    {/* KONTAK */}
                    <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded w-fit">
                            {m.phone_number}
                        </div>
                    </td>

                    {/* BIDANG (FIXED) */}
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-[#0077AF] px-3 py-1 rounded-full text-xs font-bold border border-blue-200 shadow-sm">
                        {/* 🔥 INI FIX UTAMANYA: Cek semua variasi nama kolom */}
                        {m.subject || m.subjects || m.expertise || "-"}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        m.status === "AKTIF" 
                            ? "bg-green-100 text-green-700 border-green-200" 
                            : "bg-red-100 text-red-700 border-red-200"
                      }`}>
                        {m.status}
                      </span>
                    </td>

                    {/* GAJI */}
                    {canViewSalary && (
                      <td className="px-6 py-4 text-right">
                        <span className="text-gray-700 font-mono font-bold text-sm">
                            {formatRupiah(m.salary_per_session || 0)}
                        </span>
                      </td>
                    )}

                    {/* AKSI */}
                    {canEditInfo && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditingMentor(m); setIsModalOpen(true) }}
                            className="bg-yellow-100 text-yellow-600 p-2 rounded-lg hover:bg-yellow-200 transition shadow-sm"
                            title="Edit Data"
                          >
                            <Pencil size={16} />
                          </button>
                          
                          {isOwner && (
                            <button
                              onClick={() => handleDelete(m.id, m.name)}
                              className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition shadow-sm"
                              title="Hapus Mentor"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
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
        onClose={() => {
          setIsModalOpen(false)
          setEditingMentor(null)
        }}
        editingMentor={editingMentor}
        onSuccess={fetchMentors}
      />
    </DashboardLayout>
  )
}