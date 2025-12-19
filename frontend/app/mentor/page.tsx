"use client"

import React, { useEffect, useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { Search, Pencil, Trash2, Briefcase, User, CheckCircle, XCircle, Phone, MapPin, DollarSign } from "lucide-react"
import MentorFormModal from "@/components/MentorFormModal"
import { getMentors, deleteMentor, Mentor } from "@/lib/mentorActions"
import { useUser } from "@/context/UserContext"
import { useLoading } from "@/context/LoadingContext"

// =============================================================================
// KOMPONEN: STAT CARD
// =============================================================================
const StatCard = ({ icon: Icon, count, label, colorClass, iconColor }: any) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 transition-transform hover:scale-[1.02]">
      <div className={`p-3 rounded-full ${colorClass} ${iconColor}`}>
          <Icon size={24} />
      </div>
      <div>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{label}</p>
          <h3 className="text-xl font-black text-gray-800">{count}</h3>
      </div>
  </div>
)

// =============================================================================
// HALAMAN UTAMA
// =============================================================================
export default function MentorPage() {
  const { user } = useUser()
  const { withLoading } = useLoading()

  // State
  const [searchQuery, setSearchQuery] = useState("")
  const [mentorData, setMentorData] = useState<any[]>([]) 
  const [activeCount, setActiveCount] = useState(0)
  const [inactiveCount, setInactiveCount] = useState(0)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null)

  // Role Check
  const role = user?.role || ''
  const isOwner = role === "OWNER"
  const isAdmin = role === "ADMIN"
  
  // Permission (Owner & Admin bisa Edit & Hapus)
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
        const active = allMentors.filter((m: any) => m.status === 'AKTIF').length
        const inactive = allMentors.filter((m: any) => m.status !== 'AKTIF').length
        
        setActiveCount(active)
        setInactiveCount(inactive)

      } catch (err) {
        console.error("Gagal mengambil data mentor:", err)
      }
    })
  }

  // Effect Search
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
        fetchMentors() 
      } catch (err) {
        alert("Gagal menghapus mentor")
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
      
      {/* Bagian Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard 
              icon={Briefcase} 
              label="Total Mentor" 
              count={activeCount + inactiveCount} 
              colorClass="bg-blue-100" iconColor="text-[#0077AF]" 
          />
          <StatCard 
              icon={CheckCircle} 
              label="Mentor Aktif" 
              count={activeCount} 
              colorClass="bg-green-100" iconColor="text-green-600" 
          />
          <StatCard 
              icon={XCircle} 
              label="Tidak Aktif" 
              count={inactiveCount} 
              colorClass="bg-red-100" iconColor="text-red-600" 
          />
      </div>

      {/* Action Bar (Search) */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-96 group">
          <input
            type="text"
            placeholder="Cari Nama, HP, atau Bidang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077AF] shadow-sm transition-all group-hover:border-gray-300"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 group-hover:text-[#0077AF] transition-colors" size={20} />
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
                        <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-400"/>
                            <span className="text-sm text-gray-600 font-mono">
                                {m.phone_number || '-'}
                            </span>
                        </div>
                    </td>

                    {/* BIDANG (FIXED) */}
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-[#0077AF] px-3 py-1 rounded-full text-xs font-bold border border-blue-100 shadow-sm inline-flex items-center gap-1">
                        <Briefcase size={10} />
                        {m.subject || m.subjects || m.expertise || "Umum"}
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
                        <div className="flex items-center justify-end gap-1 text-gray-700 font-mono font-bold text-sm">
                            <span className="text-gray-400 text-xs font-normal">Rp</span>
                            {new Intl.NumberFormat("id-ID").format(m.salary_per_session || 0)}
                        </div>
                      </td>
                    )}

                    {/* AKSI (EDIT & DELETE) */}
                    {canEditInfo && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          {/* TOMBOL EDIT (Untuk Status & Data) */}
                          <button
                            onClick={() => { setEditingMentor(m); setIsModalOpen(true) }}
                            className="p-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-all border border-yellow-200 shadow-sm"
                            title="Edit Data & Status"
                          >
                            <Pencil size={16} />
                          </button>
                          
                          {/* TOMBOL DELETE (Owner & Admin) */}
                          <button
                            onClick={() => handleDelete(m.id, m.name)}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all border border-red-200 shadow-sm"
                            title="Hapus Mentor"
                          >
                            <Trash2 size={16} />
                          </button>
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