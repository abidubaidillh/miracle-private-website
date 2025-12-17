"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useRouter } from 'next/navigation'
import { 
    Calendar, CheckCircle, AlertCircle, CreditCard, 
    Wallet, UploadCloud, X, Lock, Eye, Download, Loader2
} from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { useLoading } from '@/context/LoadingContext'
import { getSalaries, saveSalaryDraft, paySalary } from '@/lib/salaryActions'
import { getAuthToken } from '@/lib/auth' // ✅ IMPORT PENTING

// 🔥 Definisi URL API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

// --- HELPER FORMAT RUPIAH ---
const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}

// --- MOCK UPLOAD SERVICE ---
const mockUploadService = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(URL.createObjectURL(file)) 
        }, 1500)
    })
}

// --- KOMPONEN: STAT CARD ---
const StatCard = ({ title, value, subtext, colorClass, icon: Icon }: any) => {
    return (
        <div className={`p-5 rounded-xl border shadow-sm flex items-center justify-between ${colorClass}`}>
            <div>
                <p className="text-xs font-bold opacity-70 uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-black mt-1">{value}</h3>
                <p className="text-[10px] font-medium opacity-80 mt-1">{subtext}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm"><Icon size={28} /></div>
        </div>
    )
}

// --- KOMPONEN: MODAL LIHAT BUKTI ---
const ViewProofModal = ({ isOpen, onClose, imageUrl, mentorName }: any) => {
    if (!isOpen || !imageUrl) return null
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">Bukti Transfer: {mentorName}</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-red-500"/></button>
                </div>
                <div className="p-4 bg-gray-200 flex justify-center">
                    <img src={imageUrl} alt="Bukti Transfer" className="max-h-[70vh] object-contain rounded-lg shadow-sm" />
                </div>
                <div className="p-4 border-t flex justify-end">
                    <a href={imageUrl} download="bukti-transfer.jpg" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-[#0077AF] hover:underline">
                        <Download size={16}/> Download / Buka Asli
                    </a>
                </div>
            </div>
        </div>
    )
}

// --- KOMPONEN: MODAL BAYAR ---
const PayModal = ({ isOpen, onClose, onConfirm, salaryData, isUploading }: any) => {
    const [proof, setProof] = useState<File | null>(null)

    useEffect(() => { setProof(null) }, [isOpen])

    if (!isOpen || !salaryData) return null

    const handleSubmit = () => {
        if (!proof) return alert("Harap sertakan bukti pembayaran (foto/screenshot)!")
        onConfirm(salaryData.id, proof)
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm px-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="font-bold text-lg text-gray-800">Konfirmasi Pembayaran</h3>
                    <button onClick={onClose} disabled={isUploading}><X size={20} className="text-gray-400 hover:text-red-500 transition"/></button>
                </div>
                
                <div className="space-y-5">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500 uppercase font-bold">Penerima</span>
                            <span className="text-xs text-gray-500 uppercase font-bold">Periode</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-gray-800 text-lg">{salaryData.mentor_name}</p>
                            <p className="text-sm font-medium text-gray-600">Bulan {salaryData.month}/{salaryData.year}</p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Transfer:</span>
                            <span className="font-mono font-black text-xl text-[#0077AF]">{formatRupiah(salaryData.total_amount)}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Bukti Transfer <span className="text-red-500">*</span></label>
                        <div className="relative group">
                            <input 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                accept="image/*"
                                disabled={isUploading}
                                onChange={(e) => setProof(e.target.files?.[0] || null)}
                            />
                            <div className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-all ${proof ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-[#0077AF] hover:bg-gray-50'}`}>
                                {proof ? (
                                    <>
                                        <CheckCircle size={32} className="text-green-500 mb-2"/>
                                        <span className="text-sm font-bold text-green-700 truncate max-w-[200px]">{proof.name}</span>
                                        <span className="text-xs text-green-600">Klik untuk ganti file</span>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={32} className="text-gray-400 mb-2 group-hover:text-[#0077AF] transition-colors"/>
                                        <span className="text-sm font-medium text-gray-600">Klik untuk upload bukti pembayaran</span>
                                        <span className="text-xs text-gray-400 mt-1">JPG, PNG, PDF (Max 2MB)</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleSubmit}
                        disabled={isUploading}
                        className={`w-full py-3.5 rounded-lg font-bold shadow-md transition-all flex justify-center items-center gap-2 text-white
                            ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0077AF] hover:bg-[#006699]'}
                        `}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="animate-spin" size={18}/> Mengupload...
                            </>
                        ) : (
                            <>
                                <CreditCard size={18} /> Proses Bayar Sekarang
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

// --- HALAMAN UTAMA ---
export default function GajiMentorPage() {
    const { user } = useUser()
    const { withLoading } = useLoading()
    const router = useRouter()

    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [year, setYear] = useState(new Date().getFullYear())
    const [salaries, setSalaries] = useState<any[]>([])
    const [stats, setStats] = useState({ total_gaji: 0, sudah_dibayar: 0, belum_dibayar: 0, count_paid: 0, count_pending: 0 })
    
    // State UI
    const [payModalOpen, setPayModalOpen] = useState(false)
    const [viewProofOpen, setViewProofOpen] = useState(false)
    const [selectedSalary, setSelectedSalary] = useState<any>(null)
    const [isUploading, setIsUploading] = useState(false)

    useEffect(() => {
        if (user) {
            const allowed = ['OWNER', 'BENDAHARA', 'ADMIN']
            if (!allowed.includes(user.role)) router.push('/dashboard')
        }
    }, [user, router])

    const canEdit = user && ['OWNER', 'BENDAHARA'].includes(user.role)

    const fetchData = async () => {
        await withLoading(async () => {
            try {
                const res = await getSalaries(month, year)
                setSalaries(res.salaries || [])
                setStats(res.stats || { total_gaji: 0, sudah_dibayar: 0, belum_dibayar: 0, count_paid: 0, count_pending: 0 })
            } catch (err) { console.error(err) }
        })
    }

    useEffect(() => { if(user) fetchData() }, [user, month, year])

    const handleUpdateBonus = async (item: any, newBonus: string) => {
        // Parse & Validasi
        const cleanBonus = parseInt(newBonus.replace(/\D/g, '')) || 0
        if (cleanBonus === item.bonus) return

        await withLoading(async () => {
            try {
                await saveSalaryDraft({
                    mentor_id: item.mentor_id,
                    month: parseInt(month.toString()),
                    year: parseInt(year.toString()),
                    total_sessions: parseInt(item.total_sessions) || 0,
                    salary_per_session: parseInt(item.salary_per_session) || 0,
                    bonus: cleanBonus
                })
                fetchData()
            } catch (e) { alert("Gagal update bonus") }
        })
    }

    // --- HANDLE CONFIRM PAY ---
    const handleConfirmPay = async (id: string, proofFile: File) => {
        setIsUploading(true)
        try {
            // 1. Upload ke Storage (Mock dulu)
            const proofUrl = await mockUploadService(proofFile)
            
            // 2. Ambil Token dengan Helper yang BENAR
            const token = getAuthToken() 
            
            if (!token) {
                alert("Sesi Anda habis. Harap login ulang.")
                router.push('/login')
                return
            }

            // 3. Kirim ke API
            const res = await fetch(`${API_URL}/salaries/${id}/pay`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Kirim Token yang valid
                },
                body: JSON.stringify({ proof_image: proofUrl }) 
            })

            const resData = await res.json()

            if (!res.ok) {
                throw new Error(resData.error || "Gagal konfirmasi pembayaran di server")
            }
            
            setPayModalOpen(false)
            setSelectedSalary(null)
            fetchData()
            alert("Pembayaran Berhasil Dicatat!")

        } catch (e: any) { 
            console.error(e)
            alert("Error: " + e.message) 
        } finally {
            setIsUploading(false)
        }
    }

    const openViewProof = (salary: any) => {
        if (!salary.proof_image) {
            alert("Bukti transfer tidak ditemukan / belum diupload.")
            return
        }
        setSelectedSalary(salary)
        setViewProofOpen(true)
    }

    if (!user) return null

    return (
        <DashboardLayout title="Penggajian Mentor">
            
            {/* Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-700 font-bold bg-gray-50 px-3 py-1.5 rounded-lg border">
                        <Calendar size={18} className="text-[#0077AF]" />
                        <span>Periode:</span>
                    </div>
                    <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="bg-white border rounded p-2 outline-none focus:ring-2 focus:ring-[#0077AF] transition-all hover:border-[#0077AF]">
                        {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Bulan {i+1}</option>)}
                    </select>
                    <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="bg-white border rounded p-2 outline-none focus:ring-2 focus:ring-[#0077AF] transition-all hover:border-[#0077AF]">
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Gaji" value={formatRupiah(stats.total_gaji)} subtext="Estimasi Pengeluaran" colorClass="bg-[#0077AF] text-white border-blue-800" icon={Wallet}/>
                <StatCard title="Sudah Dibayar" value={formatRupiah(stats.sudah_dibayar)} subtext="Lunas" colorClass="bg-green-100 text-green-800 border-green-200" icon={CheckCircle}/>
                <StatCard title="Belum Dibayar" value={formatRupiah(stats.belum_dibayar)} subtext="Pending" colorClass="bg-red-50 text-red-800 border-red-200" icon={AlertCircle}/>
            </div>

            {/* Tabel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-700 border-b">
                        <tr>
                            <th className="px-6 py-4 font-bold text-sm">Nama Mentor</th>
                            <th className="px-6 py-4 font-bold text-sm">Rate / Sesi</th>
                            <th className="px-6 py-4 font-bold text-sm text-center bg-gray-50/50">Target</th>
                            <th className="px-6 py-4 font-bold text-sm text-center bg-blue-50/30">Terlaksana</th>
                            <th className="px-6 py-4 font-bold text-sm w-32">Bonus (Rp)</th>
                            <th className="px-6 py-4 font-bold text-sm">Total Terima</th>
                            <th className="px-6 py-4 font-bold text-sm text-center">Status</th>
                            <th className="px-6 py-4 font-bold text-sm text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {salaries.length === 0 ? (
                            <tr><td colSpan={8} className="p-12 text-center text-gray-400 font-medium">Tidak ada data mentor aktif.</td></tr>
                        ) : salaries.map((s) => {
                            const isPaid = s.status === 'PAID'
                            
                            return (
                                <tr key={s.mentor_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-800">{s.mentor_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{formatRupiah(s.salary_per_session)}</td>
                                    <td className="px-6 py-4 text-center text-gray-500 font-medium bg-gray-50/50">{s.target_sessions || 0}</td>
                                    <td className="px-6 py-4 text-center font-bold text-[#0077AF] bg-blue-50/30">
                                        <div className="flex items-center justify-center gap-1">{s.total_sessions} <Lock size={12} className="text-gray-400" /></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input 
                                            type="number" defaultValue={s.bonus} disabled={isPaid || !canEdit}
                                            className={`w-28 border rounded-lg p-1.5 font-mono text-sm outline-none focus:ring-2 focus:ring-[#0077AF] transition-all ${isPaid ? 'bg-gray-100 text-gray-400 border-transparent' : 'bg-white border-gray-300'}`}
                                            onBlur={(e) => canEdit && !isPaid && handleUpdateBonus(s, e.target.value)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-mono font-black text-[#0077AF] text-base">{formatRupiah(s.total_amount)}</td>
                                    <td className="px-6 py-4 text-center">
                                        {isPaid ? (
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 shadow-sm">
                                                <CheckCircle size={12}/> LUNAS
                                            </span>
                                        ) : (
                                            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 shadow-sm">
                                                <AlertCircle size={12}/> PENDING
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {canEdit && !isPaid ? (
                                            s.id ? (
                                                <button onClick={() => { setSelectedSalary(s); setPayModalOpen(true); }} className="bg-[#0077AF] hover:bg-[#006699] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 mx-auto shadow-md hover:shadow-lg transition-all">
                                                    <CreditCard size={14}/> Bayar
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic font-medium">Auto-Draft</span>
                                            )
                                        ) : isPaid ? (
                                            <button onClick={() => openViewProof(s)} className="text-green-600 font-bold text-xs hover:underline flex items-center justify-center gap-1 mx-auto">
                                                <Eye size={14}/> Lihat Bukti
                                            </button>
                                        ) : ( <span className="text-xs text-gray-400">-</span> )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <PayModal 
                isOpen={payModalOpen} 
                onClose={() => setPayModalOpen(false)}
                salaryData={selectedSalary}
                onConfirm={handleConfirmPay}
                isUploading={isUploading}
            />

            <ViewProofModal
                isOpen={viewProofOpen}
                onClose={() => setViewProofOpen(false)}
                imageUrl={selectedSalary?.proof_image}
                mentorName={selectedSalary?.mentor_name}
            />

        </DashboardLayout>
    )
}