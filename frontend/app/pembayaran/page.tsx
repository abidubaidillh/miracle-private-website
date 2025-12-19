"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Search, PlusCircle, Printer, Trash2, CreditCard, CheckCircle, UploadCloud, X, Loader2, Download, Eye, EyeOff } from 'lucide-react'
import { getPayments, createPayment, deletePayment } from '@/lib/paymentActions' 
import { useUser } from '@/context/UserContext'
import { useLoading } from '@/context/LoadingContext'
import PaymentFormModal from '@/components/PaymentFormModal'
import { getAuthToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

const mockUploadService = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(URL.createObjectURL(file)) 
        }, 1500)
    })
}

const printReceipt = (payment: any) => {
    if (payment.status !== 'LUNAS') {
        alert("Struk hanya bisa dicetak untuk pembayaran LUNAS.")
        return
    }
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (printWindow) {
        printWindow.document.write(`
            <html>
                <head>
                    <title>Struk Pembayaran - Miracle Private</title>
                    <style>
                        body { font-family: 'Courier New', monospace; padding: 20px; text-align: center; }
                        .header { border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                        .content { text-align: left; margin-bottom: 20px; }
                        .total { border-top: 2px dashed #000; padding-top: 10px; font-weight: bold; font-size: 1.2em; }
                        .footer { font-size: 0.8em; color: #555; margin-top: 30px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>MIRACLE PRIVATE</h2>
                        <p>Bukti Pembayaran Les</p>
                        <p>${new Date(payment.payment_date).toLocaleDateString('id-ID')}</p>
                    </div>
                    <div class="content">
                        <p><strong>Siswa:</strong> ${payment.students?.name || 'Umum'}</p>
                        <p><strong>Ket:</strong> ${payment.title}</p>
                        <p><strong>Metode:</strong> ${payment.method}</p>
                        <p><strong>Status:</strong> LUNAS</p>
                    </div>
                    <div class="total">
                        Total: ${formatRupiah(payment.amount)}
                    </div>
                    <div class="footer">
                        Terima Kasih.<br/>Simpan struk ini sebagai bukti sah.
                    </div>
                    <script>window.print();</script>
                </body>
            </html>
        `)
        printWindow.document.close()
    }
}

// ✅ FIXED: Komponen PayModal dengan pilihan Metode
const PayModal = ({ isOpen, onClose, onConfirm, paymentData, isUploading }: any) => {
    const [proof, setProof] = useState<File | null>(null)
    const [method, setMethod] = useState('TRANSFER')

    useEffect(() => { 
        setProof(null) 
        setMethod('TRANSFER')
    }, [isOpen])

    if (!isOpen || !paymentData) return null

    const handleSubmit = () => {
        if (method === 'TRANSFER' && !proof) {
            return alert("Untuk metode Transfer, wajib sertakan bukti pembayaran!")
        }
        onConfirm(paymentData.id, proof, method)
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm px-4 animate-fade-in">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="font-bold text-lg text-gray-800">Konfirmasi Pelunasan</h3>
                    <button onClick={onClose} disabled={isUploading}><X size={20} className="text-gray-400 hover:text-red-500 transition"/></button>
                </div>
                
                <div className="space-y-5">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="font-bold text-gray-800 text-lg">{paymentData.title}</p>
                        <p className="text-sm text-gray-500 mt-1">Siswa: {paymentData.students?.name || '-'}</p>
                        <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Tagihan:</span>
                            <span className="font-mono font-black text-xl text-[#0077AF]">{formatRupiah(paymentData.amount)}</span>
                        </div>
                    </div>

                    {/* ✅ INPUT METODE PEMBAYARAN */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Metode Pembayaran</label>
                        <select 
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077AF] outline-none"
                        >
                            <option value="TRANSFER">Transfer Bank</option>
                            <option value="CASH">Tunai (Cash)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Bukti Pembayaran {method === 'TRANSFER' && <span className="text-red-500">*</span>}
                        </label>
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
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={32} className="text-gray-400 mb-2 group-hover:text-[#0077AF] transition-colors"/>
                                        <span className="text-sm font-medium text-gray-600 text-center">Upload Struk / Bukti</span>
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
                        {isUploading ? <><Loader2 className="animate-spin" size={18}/> Memproses...</> : <><CheckCircle size={18} /> Konfirmasi Lunas</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

const ViewProofModal = ({ isOpen, onClose, imageUrl }: any) => {
    if (!isOpen || !imageUrl) return null
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">Bukti Pembayaran</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-red-500"/></button>
                </div>
                <div className="p-4 bg-gray-200 flex justify-center">
                    <img src={imageUrl} alt="Bukti" className="max-h-[70vh] object-contain rounded-lg shadow-sm" />
                </div>
                <div className="p-4 border-t flex justify-end">
                    <a href={imageUrl} download="bukti-bayar.jpg" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-[#0077AF] hover:underline">
                        <Download size={16}/> Download
                    </a>
                </div>
            </div>
        </div>
    )
}

export default function PembayaranPage() {
    const { user } = useUser()
    const { withLoading } = useLoading()
    
    const [payments, setPayments] = useState<any[]>([])
    const [stats, setStats] = useState({ total_lunas: 0, total_pending: 0, total_uang: 0 })
    const [search, setSearch] = useState('')
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isPayModalOpen, setIsPayModalOpen] = useState(false)
    const [isViewProofOpen, setIsViewProofOpen] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState<any>(null)
    const [isUploading, setIsUploading] = useState(false)

    const role = user?.role || ''
    const canCreate = ['OWNER', 'ADMIN', 'BENDAHARA'].includes(role)
    const canDelete = ['OWNER', 'BENDAHARA'].includes(role)

    const fetchData = async () => {
        await withLoading(async () => {
            try {
                const res = await getPayments(search)
                setPayments(res.payments)
                setStats(res.stats)
            } catch (err) { console.error(err) }
        })
    }

    useEffect(() => {
        const timer = setTimeout(() => fetchData(), 500)
        return () => clearTimeout(timer)
    }, [search])

    const handleCreate = async (formData: any) => {
        await withLoading(async () => {
            try {
                let proofUrl = null
                if (formData.proof_file) {
                    proofUrl = await mockUploadService(formData.proof_file)
                }
                const payload = { ...formData, proof_image: proofUrl }
                delete payload.proof_file
                await createPayment(payload)
                setIsCreateModalOpen(false)
                fetchData()
            } catch (err) {
                console.error(err)
                alert("Gagal menyimpan data")
            }
        })
    }

    // ✅ FIXED: Handle Confirm Pay dengan parameter Method
    const handleConfirmPay = async (id: string, proofFile: File | null, method: string) => {
        setIsUploading(true)
        try {
            let proofUrl = null
            if (proofFile) {
                proofUrl = await mockUploadService(proofFile)
            }

            const token = getAuthToken()
            if (!token) return alert("Sesi habis.")

            const res = await fetch(`${API_URL}/payments/${id}/pay`, {
                method: 'POST', 
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    status: 'LUNAS',
                    proof_image: proofUrl,
                    method: method // Kirim metode ke backend
                }) 
            })

            const resData = await res.json()
            if (!res.ok) throw new Error(resData.error || resData.message || "Gagal update status")

            setIsPayModalOpen(false)
            setSelectedPayment(null)
            fetchData()
            alert("Pembayaran berhasil dilunasi!")

        } catch (err: any) {
            alert("Gagal memproses: " + err.message)
        } finally {
            setIsUploading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if(!confirm("Yakin hapus data pembayaran ini?")) return
        await withLoading(async () => {
            try {
                await deletePayment(id)
                fetchData()
            } catch (err) { alert("Gagal menghapus data") }
        })
    }

    return (
        <DashboardLayout title="Pembayaran Les">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full text-green-600"><CreditCard size={24}/></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Pemasukan</p>
                        <h3 className="text-xl font-bold text-gray-800">{formatRupiah(stats.total_uang)}</h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600"><CheckCircle size={24}/></div>
                    <div>
                        <p className="text-sm text-gray-500">Transaksi Lunas</p>
                        <h3 className="text-xl font-bold text-gray-800">{stats.total_lunas} Transaksi</h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="bg-red-100 p-3 rounded-full text-red-600"><X size={24}/></div>
                    <div>
                        <p className="text-sm text-gray-500">Belum Lunas</p>
                        <h3 className="text-xl font-bold text-gray-800">{stats.total_pending} Murid</h3>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-96">
                    <input 
                        type="text" 
                        placeholder="Cari murid atau keterangan..." 
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077AF]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                </div>
                {canCreate && (
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center bg-[#0077AF] hover:bg-[#006699] text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all"
                    >
                        <PlusCircle size={20} className="mr-2" /> Input Pembayaran
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>
                            <th className="px-6 py-4 font-bold text-sm">Tanggal</th>
                            <th className="px-6 py-4 font-bold text-sm">Nama Murid</th>
                            <th className="px-6 py-4 font-bold text-sm">Keterangan</th>
                            <th className="px-6 py-4 font-bold text-sm text-right">Nominal</th>
                            <th className="px-6 py-4 font-bold text-sm text-center">Metode</th>
                            <th className="px-6 py-4 font-bold text-sm text-center">Status</th>
                            <th className="px-6 py-4 font-bold text-sm text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {payments.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-8 text-gray-400">Belum ada data pembayaran</td></tr>
                        ) : payments.map((p) => {
                            const isLunas = p.status === 'LUNAS' || p.status === 'PAID'
                            return (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(p.payment_date).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{p.students?.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{p.title}</td>
                                    <td className="px-6 py-4 font-mono font-bold text-[#0077AF] text-right">
                                        {formatRupiah(p.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${p.method === 'TRANSFER' ? 'bg-blue-50 text-blue-700 border-blue-100' : p.method === 'CASH' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                            {p.method || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                                            isLunas ? 'bg-[#5AB267]' : 'bg-red-500'
                                        }`}>
                                            {isLunas ? 'LUNAS' : 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2 items-center">
                                            {isLunas ? (
                                                <>
                                                    <button onClick={() => printReceipt(p)} className="p-2 text-gray-500 hover:text-[#0077AF] rounded-lg transition"><Printer size={18} /></button>
                                                    {p.proof_image ? (
                                                        <button onClick={() => { setSelectedPayment(p); setIsViewProofOpen(true); }} className="p-2 text-gray-500 hover:text-green-600 rounded-lg transition"><Eye size={18} /></button>
                                                    ) : (
                                                        <button disabled className="p-2 text-gray-300 cursor-not-allowed"><EyeOff size={18} /></button>
                                                    )}
                                                </>
                                            ) : (
                                                <button onClick={() => { setSelectedPayment(p); setIsPayModalOpen(true); }} className="bg-[#0077AF] hover:bg-[#006699] text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-sm transition-all flex items-center gap-1"><CreditCard size={14}/> Bayar</button>
                                            )}
                                            {canDelete && (
                                                <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition"><Trash2 size={18} /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <PaymentFormModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreate} />
            <PayModal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} onConfirm={handleConfirmPay} paymentData={selectedPayment} isUploading={isUploading} />
            <ViewProofModal isOpen={isViewProofOpen} onClose={() => setIsViewProofOpen(false)} imageUrl={selectedPayment?.proof_image} />
        </DashboardLayout>
    )
}