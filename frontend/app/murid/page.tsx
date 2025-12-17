"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { 
    Search, 
    UserPlus, 
    Pencil, 
    Trash2, 
    X, 
    Save, 
    Users, 
    CheckCircle, 
    XCircle,
    User 
} from 'lucide-react'
import { getStudents, createStudent, updateStudent, deleteStudent, Student } from '@/lib/studentActions'
import { useLoading } from '@/context/LoadingContext'
import { useUser } from '@/context/UserContext'

// =============================================================================
// KOMPONEN: STAT PILL
// =============================================================================
const StatPill = ({ icon: Icon, count, label, colorClass, iconColor }: any) => (
    <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 min-w-[180px]">
        <div className={`p-2 rounded-full ${colorClass}`}>
            <Icon size={20} className={iconColor} />
        </div>
        <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">{label}</p>
            <p className="text-lg font-bold text-gray-800">{count}</p>
        </div>
    </div>
)

// =============================================================================
// KOMPONEN: MODAL FORM
// =============================================================================
interface ModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: any) => void
    initialData: Student | null
}

function StudentModal({ isOpen, onClose, onSubmit, initialData }: ModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        phone_number: '',
        address: '',
        parent_name: '',
        parent_phone: '',
        status: 'AKTIF'
    })

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                age: initialData.age.toString(),
                phone_number: initialData.phone_number,
                address: initialData.address || '',
                parent_name: initialData.parent_name || '',
                parent_phone: initialData.parent_phone || '',
                status: initialData.status
            })
        } else {
            setFormData({ name: '', age: '', phone_number: '', address: '', parent_name: '', parent_phone: '', status: 'AKTIF' })
        }
    }, [initialData, isOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div>
                        <h2 className="font-bold text-xl text-[#0077AF]">
                            {initialData ? 'Edit Data Murid' : 'Tambah Murid Baru'}
                        </h2>
                        <p className="text-xs text-gray-500">Isi data diri murid dengan lengkap.</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
                        <X size={24} className="text-gray-400 hover:text-red-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                        <input required type="text" placeholder="Nama siswa" 
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0077AF] outline-none transition"
                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Usia</label>
                            <input required type="number" placeholder="Contoh: 12"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0077AF] outline-none transition"
                                value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">No HP Murid</label>
                            <input type="text" placeholder="08..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0077AF] outline-none transition"
                                value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Alamat Domisili</label>
                        <textarea rows={2} placeholder="Alamat lengkap..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0077AF] outline-none transition"
                            value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} 
                        />
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                        <h4 className="text-xs font-bold text-[#0077AF] mb-3 uppercase tracking-wider flex items-center gap-2">
                            <User size={14}/> Data Orang Tua / Wali
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Orang Tua</label>
                                <input required type="text" placeholder="Nama ortu"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0077AF] outline-none"
                                    value={formData.parent_name} onChange={e => setFormData({...formData, parent_name: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">No HP Ortu (WA)</label>
                                <input required type="text" placeholder="08..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0077AF] outline-none"
                                    value={formData.parent_phone} onChange={e => setFormData({...formData, parent_phone: e.target.value})} 
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Status Keaktifan</label>
                        <select 
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#0077AF] outline-none transition"
                            value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                        >
                            <option value="AKTIF">✅ Aktif</option>
                            <option value="NON-AKTIF">❌ Tidak Aktif</option>
                        </select>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full bg-[#0077AF] hover:bg-[#006699] text-white py-3 rounded-lg font-bold shadow-md transition-all flex justify-center items-center gap-2">
                            <Save size={18} /> Simpan Data
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// =============================================================================
// HALAMAN UTAMA
// =============================================================================
export default function MuridPage() {
    const { withLoading } = useLoading()
    const { user } = useUser()
    
    // State Data
    const [searchQuery, setSearchQuery] = useState('')
    const [students, setStudents] = useState<Student[]>([])
    const [stats, setStats] = useState({ active: 0, inactive: 0 })
    
    // State UI
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingStudent, setEditingStudent] = useState<Student | null>(null)

    // Hak Akses
    const role = user?.role || ''
    const canEdit = ['OWNER', 'ADMIN'].includes(role)

    // 1. Fetch Data (MENGGUNAKAN withLoading agar loading screen muncul)
    const fetchStudents = async () => {
        await withLoading(async () => {
            try {
                const result = await getStudents(searchQuery)
                setStudents(result.students || [])
                setStats(result.stats || { active: 0, inactive: 0 })
            } catch (err) {
                console.error("Fetch Error:", err);
            }
        })
    }

    // Effect Search (Debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents()
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // 2. Handler Submit (Create/Update)
    const handleFormSubmit = async (formData: any) => {
        await withLoading(async () => {
            try {
                if (editingStudent) {
                    await updateStudent(editingStudent.id, formData)
                } else {
                    await createStudent(formData)
                }
                setIsModalOpen(false)
                setEditingStudent(null)
                fetchStudents() 
            } catch (err: any) {
                alert("Gagal menyimpan data: " + err.message)
            }
        })
    }

    // 3. Handler Delete
    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Yakin ingin menghapus data murid: ${name}?`)) return

        await withLoading(async () => {
            try {
                await deleteStudent(id)
                fetchStudents()
            } catch (error) {
                alert("Gagal menghapus data murid")
            }
        })
    }

    const openCreateModal = () => {
        setEditingStudent(null)
        setIsModalOpen(true)
    }

    const openEditModal = (student: Student) => {
        setEditingStudent(student)
        setIsModalOpen(true)
    }

    return (
        <DashboardLayout title="Data Murid">
            
            {/* Bagian Statistik */}
            <div className="flex flex-wrap gap-4 mb-8">
                <StatPill 
                    icon={Users} 
                    label="Total Murid" 
                    count={students.length} 
                    colorClass="bg-blue-100" iconColor="text-[#0077AF]" 
                />
                <StatPill 
                    icon={CheckCircle} 
                    label="Murid Aktif" 
                    count={stats.active} 
                    colorClass="bg-green-100" iconColor="text-green-600" 
                />
                <StatPill 
                    icon={XCircle} 
                    label="Tidak Aktif" 
                    count={stats.inactive} 
                    colorClass="bg-red-100" iconColor="text-red-600" 
                />
            </div>

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Cari nama, no HP, atau orang tua..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077AF] shadow-sm transition-all"
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                </div>

                {canEdit && (
                    <button
                        onClick={openCreateModal}
                        className="flex items-center px-6 py-3 bg-[#0077AF] text-white rounded-lg font-bold text-sm hover:bg-[#006699] transition shadow-md w-full md:w-auto justify-center"
                    >
                        <UserPlus size={18} className="mr-2" /> Tambah Murid
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-bold text-sm">Nama Murid</th>
                                <th className="px-6 py-4 font-bold text-sm text-center">Usia</th>
                                <th className="px-6 py-4 font-bold text-sm">Data Orang Tua</th>
                                <th className="px-6 py-4 font-bold text-sm text-center">Status</th>
                                {canEdit && <th className="px-6 py-4 font-bold text-sm text-center">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={canEdit ? 5 : 4} className="p-12 text-center text-gray-400 font-medium">
                                        Data tidak ditemukan atau belum ada murid terdaftar.
                                    </td>
                                </tr>
                            ) : (
                                students.map((m) => (
                                    <tr key={m.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-800">{m.name}</p>
                                            <p className="text-xs text-gray-500 font-mono">{m.phone_number || '-'}</p>
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-1 italic">{m.address}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 text-center font-medium">
                                            {m.age} Thn
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-gray-700">{m.parent_name}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase">WA</span>
                                                <span className="text-xs text-[#0077AF] font-mono">{m.parent_phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm ${m.status === 'AKTIF' ? 'bg-[#5AB267]' : 'bg-[#FF0000]'}`}>
                                                {m.status}
                                            </span>
                                        </td>
                                        {canEdit && (
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button 
                                                        onClick={() => openEditModal(m)} 
                                                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
                                                        title="Edit Data"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(m.id, m.name)} 
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Hapus Data"
                                                    >
                                                        <Trash2 size={18} />
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

            {/* Render Modal */}
            <StudentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingStudent}
            />
        </DashboardLayout>
    )
}