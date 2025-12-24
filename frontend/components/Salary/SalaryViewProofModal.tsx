"use client"

import React from 'react'
import { X, Download } from 'lucide-react'

interface SalaryViewProofModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string | null
  mentorName: string | null
}

export default function SalaryViewProofModal({ 
  isOpen, 
  onClose, 
  imageUrl, 
  mentorName 
}: SalaryViewProofModalProps) {
  if (!isOpen || !imageUrl) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] backdrop-blur-sm p-4 animate-in fade-in duration-300" 
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800">
            Bukti Transfer: {mentorName || 'Saya'}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Image Container */}
        <div className="p-4 bg-gray-200 flex justify-center">
          <img 
            src={imageUrl} 
            alt="Bukti Transfer" 
            className="max-h-[70vh] object-contain rounded-lg shadow-sm"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/placeholder-image-error.png' // Fallback image
            }}
          />
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t flex justify-end bg-gray-50">
          <a 
            href={imageUrl} 
            download="bukti-transfer.jpg" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-2 text-sm font-bold text-[#0077AF] hover:underline transition-colors"
          >
            <Download size={16}/> 
            Download / Buka Asli
          </a>
        </div>
      </div>
    </div>
  )
}