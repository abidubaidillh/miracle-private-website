"use client"

import React from 'react'
import { X, Download, ExternalLink } from 'lucide-react'

interface ImagePreviewModalProps {
  isOpen: boolean
  imageUrl: string | null
  onClose: () => void
}

export default function ImagePreviewModal({ 
  isOpen, 
  imageUrl, 
  onClose 
}: ImagePreviewModalProps) {
  if (!isOpen || !imageUrl) return null

  // Handle download
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `bukti-absensi-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle open in new tab
  const handleOpenNewTab = () => {
    window.open(imageUrl, '_blank')
  }

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">
            Bukti Foto Absensi
          </h3>
          <div className="flex items-center gap-2">
            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Download foto"
            >
              <Download size={20} />
            </button>
            
            {/* Open in New Tab Button */}
            <button
              onClick={handleOpenNewTab}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Buka di tab baru"
            >
              <ExternalLink size={20} />
            </button>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Tutup"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="relative overflow-auto max-h-[calc(90vh-80px)]">
          <div className="flex items-center justify-center min-h-[400px] p-4">
            <img
              src={imageUrl}
              alt="Bukti Absensi"
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/placeholder-image-error.png' // Fallback image
              }}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Klik di luar gambar atau tekan ESC untuk menutup</span>
            <span className="text-xs">
              URL: {imageUrl.length > 50 ? `${imageUrl.substring(0, 50)}...` : imageUrl}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}