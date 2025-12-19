"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { 
    Search, UserPlus, Pencil, Trash2, X, Save, 
    Users, CheckCircle, XCircle, User, Phone, MapPin, Smile
} from 'lucide-react'
import { getStudents, createStudent, updateStudent, deleteStudent, Student } from '@/lib/studentActions'
import { useLoading } from '@/context/LoadingContext'
import { useUser } from '@/context/UserContext'

// =============================================================================
// KOMPONEN: STAT CARD (Updated Design)
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity px-4">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto flex flex-col">
                
                {/* Header Modal */}
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="font-bold text-xl text-gray-800">
                            {initialData ? 'Edit Data Murid' : 'Tambah Murid Baru'}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Pastikan data yang diisi valid.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-red-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    
                    {/* Data Pribadi */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-[#0077AF] uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                            <Smile size={14}/> Data Pribadi
                        </h4>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                            <input required type="text" placeholder="Nama siswa" 
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0077AF] outline-none transition"
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Usia (Tahun)</label>
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
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0077AF] outline-none transition resize-none"
                                value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} 
                            />
                        </div>
                    </div>
                    
                    {/* Data Orang Tua */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
                        <h4 className="text-xs font-bold text-[#0077AF] uppercase tracking-wider flex items-center gap-2">
                            <User size={14}/> Data Orang Tua / Wali
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Orang Tua</label>
                                <input required type="text" placeholder="Nama ortu"
                                    className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0077AF] outline-none bg-white"
                                    value={formData.parent_name} onChange={e => setFormData({...formData, parent_name: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">No HP Ortu (WA)</label>
                                <input required type="text" placeholder="08..."
                                    className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0077AF] outline-none bg-white"
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

                    <div className="pt-2">
                        <button type="submit" className="w-full bg-[#0077AF] hover:bg-[#006699] text-white py-3 rounded-lg font-bold shadow-md transition-all flex justify-center items-center gap-2 active:scale-95">
                            <Save size={18} /> Simpan Data Murid
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

    // Fetch Data
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

    // Handler Submit
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

    // Handler Delete
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard 
                    icon={Users} 
                    label="Total Murid" 
                    count={students.length} 
                    colorClass="bg-blue-100" iconColor="text-[#0077AF]" 
                />
                <StatCard 
                    icon={CheckCircle} 
                    label="Murid Aktif" 
                    count={stats.active} 
                    colorClass="bg-green-100" iconColor="text-green-600" 
                />
                <StatCard 
                    icon={XCircle} 
                    label="Tidak Aktif" 
                    count={stats.inactive} 
                    colorClass="bg-red-100" iconColor="text-red-600" 
                />
            </div>

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-96 group">
                    <input
                        type="text"
                        placeholder="Cari nama, HP, atau orang tua..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077AF] shadow-sm transition-all group-hover:border-gray-300"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 group-hover:text-[#0077AF] transition-colors" size={20} />
                </div>

                {canEdit && (
                    <button
                        onClick={openCreateModal}
                        className="flex items-center px-6 py-2.5 bg-[#0077AF] text-white rounded-lg font-bold text-sm hover:bg-[#006699] transition shadow-md w-full md:w-auto justify-center gap-2"
                    >
                        <UserPlus size={18} /> Tambah Murid
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Nama Murid</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Usia</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Data Orang Tua</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Status</th>
                                {canEdit && <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={canEdit ? 5 : 4} className="p-12 text-center text-gray-400 italic">
                                        Data tidak ditemukan atau belum ada murid terdaftar.
                                    </td>
                                </tr>
                            ) : (
                                students.map((m) => (
                                    <tr key={m.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">{m.name}</div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <Phone size={10} />
                                                <span className="font-mono">{m.phone_number || '-'}</span>
                                            </div>
                                            {m.address && (
                                                <div className="flex items-start gap-1 text-xs text-gray-400 mt-1 italic max-w-[200px] truncate">
                                                    <MapPin size={10} className="mt-0.5 shrink-0" />
                                                    {m.address}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 text-center font-medium">
                                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-700 border border-gray-200">
                                                {m.age} Thn
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-gray-700">{m.parent_name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase border border-green-200">WA</span>
                                                <span className="text-xs text-[#0077AF] font-mono hover:underline cursor-pointer">{m.parent_phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                                m.status === 'AKTIF' 
                                                ? 'bg-green-100 text-green-700 border-green-200' 
                                                : 'bg-red-100 text-red-700 border-red-200'
                                            }`}>
                                                {m.status}
                                            </span>
                                        </td>
                                        {canEdit && (
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-2 opacity-100">
                                                    <button 
                                                        onClick={() => openEditModal(m)} 
                                                        className="p-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-all border border-yellow-200 shadow-sm"
                                                        title="Edit Data"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(m.id, m.name)} 
                                                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all border border-red-200 shadow-sm"
                                                        title="Hapus Data"
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