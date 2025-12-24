"use client"

import React, { useState, useEffect } from 'react'
import { X, CheckCircle, UploadCloud, CreditCard, Loader2 } from 'lucide-react'

interface SalaryData {
  id: string
  mentor_id: string
  mentor_name: string
  month: number
  year: number
  total_amount: number
}

interface SalaryPayModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (id: string, proofFile: File) => Promise<void>
  salaryData: SalaryData | null
  isUploading: boolean
}

// Helper function for formatting currency
const formatRupiah = (num: number) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(num)
}

export default function SalaryPayModal({
  isOpen,
  onClose,
  onConfirm,
  salaryData,
  isUploading
}: SalaryPayModalProps) {
  const [proof, setProof] = useState<File | null>(null)

  useEffect(() => { 
    setProof(null) 
  }, [isOpen])

  if (!isOpen || !salaryData) return null

  const handleSubmit = async () => {
    if (!proof) {
      alert("Harap sertakan bukti pembayaran (foto/screenshot)!")
      return
    }
    
    await onConfirm(salaryData.id || salaryData.mentor_id, proof)
  }

  const handleClose = () => {
    if (!isUploading) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] backdrop-blur-sm px-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="font-bold text-lg text-gray-800">Konfirmasi Pembayaran</h3>
          <button 
            onClick={handleClose} 
            disabled={isUploading}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-5">
          {/* Payment Summary */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500 uppercase font-bold">Penerima</span>
              <span className="text-xs text-gray-500 uppercase font-bold">Periode</span>
            </div>
            <div className="flex justify-between items-center">
              <p className="font-bold text-gray-800 text-lg">{salaryData.mentor_name}</p>
              <p className="text-sm font-medium text-gray-600">
                Bulan {salaryData.month}/{salaryData.year}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Transfer:</span>
              <span className="font-mono font-black text-xl text-[#0077AF]">
                {formatRupiah(salaryData.total_amount)}
              </span>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Bukti Transfer <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                accept="image/*"
                disabled={isUploading}
                onChange={(e) => setProof(e.target.files?.[0] || null)}
              />
              <div className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-all ${
                proof 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-[#0077AF] hover:bg-gray-50'
              }`}>
                {proof ? (
                  <>
                    <CheckCircle size={32} className="text-green-500 mb-2"/>
                    <span className="text-sm font-bold text-green-700 truncate max-w-[200px]">
                      {proof.name}
                    </span>
                    <span className="text-xs text-green-600">Klik untuk ganti file</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={32} className="text-gray-400 mb-2 group-hover:text-[#0077AF] transition-colors"/>
                    <span className="text-sm font-medium text-gray-600">
                      Klik untuk upload bukti pembayaran
                    </span>
                    <span className="text-xs text-gray-400 mt-1">JPG, PNG, PDF (Max 2MB)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleSubmit}
            disabled={isUploading || !proof}
            className={`w-full py-3.5 rounded-lg font-bold shadow-md transition-all flex justify-center items-center gap-2 text-white ${
              isUploading || !proof
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#0077AF] hover:bg-[#006699] hover:shadow-lg'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin" size={18}/>
                Mengupload...
              </>
            ) : (
              <>
                <CreditCard size={18} />
                Proses Bayar Sekarang
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}