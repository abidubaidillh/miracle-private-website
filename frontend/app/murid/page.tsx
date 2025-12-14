// frontend/app/murid/page.tsx
"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import Input from '@/components/Input'
import { Search, UserPlus, Pencil, Trash2, Loader2, GraduationCap, Users } from 'lucide-react'
import MuridFormModal from '@/components/MuridFormModal' 
// Pastikan deleteStudent diimport
import { getStudentsData, deleteStudent, Student } from '@/lib/studentActions' 

// Komponen Card Statistik
const StudentStatsCard = ({ title, count, bgColor, textColor }) => (
    <div
        className="px-4 py-2 rounded-full flex items-center justify-center font-semibold shadow-sm"
        style={{
            backgroundColor: bgColor,
            color: textColor, 
            minWidth: '180px', 
            height: '40px', 
            fontFamily: 'Inter',
            fontSize: '14px', 
            fontWeight: 600,
        }}
    >
        <GraduationCap size={18} className="mr-2" />
        {title} : {count}
    </div>
)

export default function MuridPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [muridData, setMuridData] = useState<Student[]>([])
    const [activeCount, setActiveCount] = useState(0)
    const [inactiveCount, setInactiveCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false) 
    
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    // Fungsi untuk Fetch Data
    const fetchStudents = async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await getStudentsData(searchQuery)
            setMuridData(result.students || []) 
            setActiveCount(result.activeCount)
            setInactiveCount(result.inactiveCount)
        } catch (err: any) {
            setError(err.message || "Gagal mengambil data murid.")
            console.error("FETCH ERROR:", err);
        } finally {
            setLoading(false)
        }
    }
    
    useEffect(() => {
        fetchStudents()
    }, [searchQuery]) 
    
    const handleEditClick = (student: Student) => {
        setEditingStudent(student);
        setIsModalOpen(true);
    };

    const handleAddMuridClick = () => {
        setEditingStudent(null);
        setIsModalOpen(true);
    }

    // --- HANDLER DELETE ---
    const handleDeleteClick = async (studentId: string, studentName: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus murid "${studentName}"?`)) {
            // Kita bisa set loading true sebentar untuk feedback visual
            // Tapi hati-hati agar tidak merender ulang seluruh tabel menjadi loading spinner jika tidak diinginkan
            // Untuk simpelnya, kita biarkan user menunggu sebentar
            try {
                await deleteStudent(studentId); 
                // Refresh data setelah delete sukses
                await fetchStudents(); 
                alert(`Murid "${studentName}" berhasil dihapus.`);
            } catch (err: any) {
                alert(err.message || "Gagal menghapus murid.");
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStudent(null);
        fetchStudents();
    };

    return (
        // Menggunakan prop title agar judul muncul di Header Dashboard
        <DashboardLayout title="Data Murid">
            <div className="p-2">
                
                {/* TOP SECTION: Stats Cards & Tombol Tambah */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    
                    {/* KIRI: Statistik */}
                    <div className="flex items-center gap-4">
                        <StudentStatsCard 
                            title="Murid Aktif" 
                            count={loading ? '...' : activeCount} 
                            bgColor="#5AB267" 
                            textColor="#000000"
                        />

                        <StudentStatsCard 
                            title="Murid Non-Aktif" 
                            count={loading ? '...' : inactiveCount} 
                            bgColor="#FF0000" 
                            textColor="#FFFFFF"
                        />
                    </div>

                    {/* KANAN: Tombol Tambah Murid */}
                    <button
                        onClick={handleAddMuridClick}
                        className="flex items-center justify-center rounded-lg text-white font-semibold shadow-md transition duration-150 ease-in-out hover:bg-[#004A77]"
                        style={{
                            width: '181px',
                            height: '50px',
                            backgroundColor: '#00558F',
                            fontFamily: 'Inter',
                            fontSize: '16px',
                            fontWeight: 600,
                        }}
                    >
                        <UserPlus size={20} className="mr-2" /> + Tambah Murid
                    </button>
                </div>
                
                {/* SEARCH BAR */}
                <div className="mb-8 w-full md:w-1/2 lg:w-1/3">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Cari Murid"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-full" 
                            style={{
                                height: '50px',
                                fontFamily: 'Inter',
                                fontSize: '14px',
                                borderRadius: '30px', 
                            }}
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <Search size={20} className="text-gray-400" />
                        </div>
                    </div>
                </div>
                
                {/* ERROR MESSAGE */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* TABLE CONTAINER */}
                <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
                    <table className="w-full">
                        <thead>
                            <tr style={{ backgroundColor: '#0077AF' }}>
                                {['Nama', 'Usia', 'No HP', 'Alamat', 'Status', 'Aksi'].map((header) => (
                                    <th
                                        key={header}
                                        className="px-6 py-4 text-left text-white font-semibold"
                                        style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 600 }}
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 size={24} className="animate-spin inline-block mr-2" /> Memuat data...
                                    </td>
                                </tr>
                            ) : muridData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <Users size={80} className="text-gray-300 mb-4" />
                                            <p className="text-gray-400 font-medium" style={{ fontFamily: 'Inter', fontSize: '16px' }}>
                                                Murid Belum Ditemukan
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                muridData.map((murid) => ( 
                                    <tr key={murid.id} className="border-t hover:bg-gray-50 transition-colors"> 
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{murid.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{murid.age}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{murid.phone_number}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{murid.address}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="px-3 py-1 rounded-full text-xs font-bold"
                                                style={{
                                                    backgroundColor: murid.status === 'AKTIF' ? '#5AB267' : '#FF0000',
                                                    color: murid.status === 'AKTIF' ? '#000000' : '#FFFFFF',
                                                }}
                                            >
                                                {murid.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                {/* TOMBOL EDIT (Pencil) */}
                                                <button 
                                                    onClick={() => handleEditClick(murid)}
                                                    className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition"
                                                    title="Edit Murid"
                                                >
                                                    <Pencil size={18} />
                                                </button>

                                                {/* TOMBOL DELETE (Trash) */}
                                                <button 
                                                    onClick={() => handleDeleteClick(murid.id, murid.name)}
                                                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                                                    title="Hapus Murid"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tambah/Edit Murid */}
            <MuridFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={fetchStudents} 
                editingStudent={editingStudent}
            />
        </DashboardLayout>
    )
}