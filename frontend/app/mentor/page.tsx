"use client"

import React, { useEffect, useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { Search, Pencil, Trash2, Briefcase, CheckCircle, XCircle, Phone } from "lucide-react"
import MentorFormModal from "@/components/MentorFormModal"
import { getMentors, deleteMentor, Mentor } from "@/lib/mentorActions"
import { useUser } from "@/context/UserContext"
import { useLoading } from "@/context/LoadingContext"
import { StatCard } from "@/components/Dashboard/StatCard"

export default function MentorPage() {
  const { user } = useUser()
  const { withLoading } = useLoading()

  const [searchQuery, setSearchQuery] = useState("")
  const [mentorData, setMentorData] = useState<Mentor[]>([]) 
  const [stats, setStats] = useState({ active: 0, inactive: 0 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null)

  const role = user?.role || ''
  const canEdit = ['OWNER', 'ADMIN'].includes(role)

  const fetchMentors = async () => {
    await withLoading(async () => {
      try {
        const result = await getMentors()
        const allMentors: Mentor[] = result.mentors || []
        
        // Frontend Filtering
        const query = searchQuery.toLowerCase()
        const filtered = allMentors.filter((m) => {
          const subject = (m as any).subject || (m as any).subjects || (m as any).expertise || ''
          return m.name.toLowerCase().includes(query) || 
                 m.phone_number?.includes(query) ||
                 subject.toLowerCase().includes(query)
        })
        
        setMentorData(filtered)
        setStats({
          active: allMentors.filter(m => m.status === 'AKTIF').length,
          inactive: allMentors.filter(m => m.status !== 'AKTIF').length
        })
      } catch (err) {
        console.error("Fetch Error:", err)
      }
    })
  }

  useEffect(() => {
    const timer = setTimeout(fetchMentors, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus mentor ${name}? Data jadwal & gaji terkait mungkin terhapus.`)) return
    await withLoading(async () => {
      try {
        await deleteMentor(id)
        fetchMentors() 
      } catch (err) { alert("Gagal menghapus") }
    })
  }

  return (
    <DashboardLayout title="Data Mentor">
      {/* Statistik Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Briefcase} label="Total Mentor" count={stats.active + stats.inactive} colorClass="bg-blue-100" iconColor="text-[#0077AF]" />
        <StatCard icon={CheckCircle} label="Mentor Aktif" count={stats.active} colorClass="bg-green-100" iconColor="text-green-600" />
        <StatCard icon={XCircle} label="Tidak Aktif" count={stats.inactive} colorClass="bg-red-100" iconColor="text-red-600" />
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-96">
          <input type="text" placeholder="Cari Nama, HP, atau Bidang..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0077AF] outline-none" />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      {/* Tabel Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase">Nama Mentor</th>
                <th className="px-6 py-4 text-xs font-bold uppercase">Kontak</th>
                <th className="px-6 py-4 text-xs font-bold uppercase">Bidang Studi</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-center">Status</th>
                {canEdit && <th className="px-6 py-4 text-xs font-bold uppercase text-right">Gaji / Sesi</th>}
                {canEdit && <th className="px-6 py-4 text-xs font-bold uppercase text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mentorData.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-400 italic">Data tidak ditemukan.</td></tr>
              ) : (
                mentorData.map((m) => (
                  <tr key={m.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{m.name}</div>
                      <div className="text-xs text-gray-400">{m.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-mono">
                        <Phone size={14} className="text-gray-400"/> {m.phone_number || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-[#0077AF] px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                        {(m as any).subject || (m as any).subjects || (m as any).expertise || "Umum"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${m.status === "AKTIF" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                        {m.status}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 text-right font-mono font-bold text-sm">
                        <span className="text-gray-400 text-xs font-normal mr-1">Rp</span>
                        {new Intl.NumberFormat("id-ID").format(m.salary_per_session || 0)}
                      </td>
                    )}
                    {canEdit && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => { setEditingMentor(m); setIsModalOpen(true) }} className="p-2 bg-yellow-50 text-yellow-600 rounded-lg border border-yellow-200">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(m.id, m.name)} className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-200">
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
        onClose={() => { setIsModalOpen(false); setEditingMentor(null); }} 
        editingMentor={editingMentor} 
        onSuccess={fetchMentors} 
      />
    </DashboardLayout>
  )
}