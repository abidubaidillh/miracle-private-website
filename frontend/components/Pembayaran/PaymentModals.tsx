"use client"
import React, { useState, useEffect } from 'react'
import { X, UploadCloud, CheckCircle, Loader2, Download } from 'lucide-react'
import { formatRupiah } from './PaymentUtils'

export const PayModal = ({ isOpen, onClose, onConfirm, paymentData, isUploading }: any) => {
    const [proof, setProof] = useState<File | null>(null)
    const [method, setMethod] = useState('TRANSFER')

    useEffect(() => { 
        setProof(null) 
        setMethod('TRANSFER')
    }, [isOpen])

    if (!isOpen || !paymentData) return null

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm px-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="font-bold text-lg text-gray-800">Konfirmasi Pelunasan</h3>
                    <button onClick={onClose} disabled={isUploading}><X size={20}/></button>
                </div>
                
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                        <p className="font-bold text-gray-800">{paymentData.title}</p>
                        <p className="font-black text-xl text-[#0077AF]">{formatRupiah(paymentData.amount)}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Metode Pembayaran</label>
                        <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full p-2 border rounded-lg">
                            <option value="TRANSFER">Transfer Bank</option>
                            <option value="CASH">Tunai (Cash)</option>
                        </select>
                    </div>

                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-all">
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => setProof(e.target.files?.[0] || null)} />
                        {proof ? <p className="text-green-600 font-bold">{proof.name}</p> : <p className="text-gray-400">Klik untuk upload bukti</p>}
                    </div>

                    <button 
                        onClick={() => onConfirm(paymentData.id, proof, method)}
                        disabled={isUploading}
                        className="w-full py-3 bg-[#0077AF] text-white rounded-lg font-bold disabled:bg-gray-400"
                    >
                        {isUploading ? <Loader2 className="animate-spin mx-auto"/> : "Konfirmasi Lunas"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export const ViewProofModal = ({ isOpen, onClose, imageUrl }: any) => {
    if (!isOpen || !imageUrl) return null
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold">Bukti Pembayaran</h3>
                    <button onClick={onClose}><X size={20}/></button>
                </div>
                <img src={imageUrl} alt="Bukti" className="w-full max-h-[70vh] object-contain" />
                <div className="p-4 flex justify-end">
                    <a href={imageUrl} download className="flex items-center gap-2 text-[#0077AF] font-bold"><Download size={16}/> Download</a>
                </div>
            </div>
        </div>
    )
}