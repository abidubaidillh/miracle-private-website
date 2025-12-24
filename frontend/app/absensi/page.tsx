"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Calendar, User, Camera, Upload, X, CheckCircle } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { useLoading } from '@/context/LoadingContext'
import { getAuthToken } from '@/lib/auth'
import AttendanceTable from '@/components/Attendance/AttendanceTable'
import { createClient } from '@supabase/supabase-js'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AbsensiPage() {
    const { user } = useUser()
    const { withLoading } = useLoading()
    
    // Filter Bulan & Tahun
    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [year, setYear] = useState(new Date().getFullYear())
    
    // State Data (Default array kosong)
    const [schedules, setSchedules] = useState<any[]>([])
    
    // Photo upload states
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [showPhotoModal, setShowPhotoModal] = useState(false)
    const [selectedSchedule, setSelectedSchedule] = useState<any>(null)
    const [selectedSession, setSelectedSession] = useState<number>(0)
    // --- FETCH DATA ---
    const fetchAbsensi = async () => {
        if (!user) return

        await withLoading(async () => {
            try {
                const token = getAuthToken()
                
                // 1. Siapkan Query Params
                let queryParams = `month=${month}&year=${year}`
                
                // 2. Cek Role: Jika MENTOR, kirim ID-nya agar backend memfilter
                if (user.role === 'MENTOR') {
                    queryParams += `&mentor_id=${user.id}`
                }

                // 3. Panggil API
                const res = await fetch(`${API_URL}/attendance?${queryParams}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                
                const data = await res.json()

                // 4. Validasi Data (Agar tidak error .map)
                if (Array.isArray(data)) {
                    setSchedules(data)
                } else {
                    console.error("Format data backend salah:", data)
                    setSchedules([]) 
                }

            } catch (err) {
                console.error("Gagal mengambil data absensi:", err)
                setSchedules([])
            }
        })
    }

    // Load saat komponen siap atau filter berubah
    useEffect(() => { if(user) fetchAbsensi() }, [user, month, year])

    // --- PHOTO UPLOAD FUNCTIONS ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onload = (e) => setPhotoPreview(e.target?.result as string)
            reader.readAsDataURL(file)
        }
    }

    const uploadPhoto = async (): Promise<string | null> => {
        if (!selectedFile || !user) return null

        try {
            setIsUploading(true)
            
            // Generate unique filename
            const fileExt = selectedFile.name.split('.').pop()
            const fileName = `${user.id}_${Date.now()}.${fileExt}`
            
            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('absensi_mentors')
                .upload(fileName, selectedFile)

            if (error) {
                console.error('Detail Error Supabase:', error)
                throw error
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('absensi_mentors')
                .getPublicUrl(fileName)

            return publicUrl

        } catch (error) {
            console.error('Detail Error Supabase:', error)
            alert('Gagal mengupload foto: ' + (error as any).message)
            return null
        } finally {
            setIsUploading(false)
        }
    }

    // --- HANDLE ATTENDANCE SUBMISSION ---
    const handleAttendanceSubmit = async (schedule: any, sessionNumber: number) => {
        if (user?.role === 'MENTOR') {
            // For mentors, show photo upload modal
            setSelectedSchedule(schedule)
            setSelectedSession(sessionNumber)
            setShowPhotoModal(true)
        } else {
            // For admin/owner, direct submit without photo
            await submitAttendance(schedule, sessionNumber, null)
        }
    }

    const submitAttendance = async (schedule: any, sessionNumber: number, photoUrl: string | null) => {
        try {
            const token = getAuthToken()
            
            const response = await fetch(`${API_URL}/attendance/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    schedule_id: schedule.id,
                    mentor_id: schedule.mentors.id,
                    session_number: sessionNumber,
                    month,
                    year,
                    status: 'HADIR',
                    bukti_foto: photoUrl
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Gagal menyimpan absensi')
            }

            // Refresh data
            await fetchAbsensi()
            
            // Reset states
            setShowPhotoModal(false)
            setSelectedFile(null)
            setPhotoPreview(null)
            setSelectedSchedule(null)
            setSelectedSession(0)

            alert('Absensi berhasil disimpan!')

        } catch (error) {
            console.error('Error submitting attendance:', error)
            alert('Gagal menyimpan absensi: ' + (error as any).message)
        }
    }

    const handlePhotoSubmit = async () => {
        if (!selectedFile) {
            alert('Silakan pilih foto terlebih dahulu')
            return
        }

        const photoUrl = await uploadPhoto()
        if (photoUrl && selectedSchedule) {
            await submitAttendance(selectedSchedule, selectedSession, photoUrl)
        }
    }

    if (!user) return null

    return (
        <DashboardLayout title="Absensi Kelas">
            
            {/* --- FILTER SECTION --- */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-700 font-bold bg-gray-50 px-3 py-1.5 rounded-lg border">
                        <Calendar size={18} className="text-[#0077AF]" />
                        <span>Periode:</span>
                    </div>
                    <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="bg-white border rounded p-2 outline-none focus:ring-2 focus:ring-[#0077AF]">
                        {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Bulan {i+1}</option>)}
                    </select>
                    <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="bg-white border rounded p-2 outline-none focus:ring-2 focus:ring-[#0077AF]">
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                    </select>
                </div>
                
                {/* Badge Info Role */}
                {user.role === 'MENTOR' && (
                    <div className="bg-blue-50 text-[#0077AF] px-3 py-1 rounded text-xs font-bold border border-blue-100 flex items-center gap-2">
                        <User size={14}/> Mode Mentor: {user.name}
                    </div>
                )}
            </div>

            {/* --- CONTENT SECTION --- */}
            <AttendanceTable 
                schedules={schedules}
                onAttendanceSubmit={handleAttendanceSubmit}
                userRole={user.role}
                isLoading={false}
            />

            {/* Photo Upload Modal */}
            {showPhotoModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300 backdrop-blur-sm">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Camera className="text-blue-600" />
                                Upload Bukti Foto Absensi
                            </h3>
                            <button
                                onClick={() => {
                                    setShowPhotoModal(false)
                                    setSelectedFile(null)
                                    setPhotoPreview(null)
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={isUploading}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {/* File Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pilih Foto <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        disabled={isUploading}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG (Max 5MB)</p>
                            </div>

                            {/* Preview */}
                            {photoPreview && (
                                <div className="animate-in fade-in duration-300">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                                    <div className="relative">
                                        <img 
                                            src={photoPreview} 
                                            alt="Preview" 
                                            className="w-full h-48 object-cover rounded-lg border shadow-sm"
                                        />
                                        <div className="absolute top-2 right-2">
                                            <div className="bg-green-500 text-white p-1 rounded-full">
                                                <CheckCircle size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowPhotoModal(false)
                                        setSelectedFile(null)
                                        setPhotoPreview(null)
                                    }}
                                    className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                                    disabled={isUploading}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handlePhotoSubmit}
                                    disabled={!selectedFile || isUploading}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Mengupload...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={16} />
                                            Submit Absensi
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}