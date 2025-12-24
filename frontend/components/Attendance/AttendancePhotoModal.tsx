"use client"

import React, { useState } from 'react'
import { Camera, Upload, X, CheckCircle } from 'lucide-react'

interface AttendancePhotoModalProps {
  isOpen: boolean
  isUploading: boolean
  onClose: () => void
  onSubmit: (file: File) => Promise<void>
}

export default function AttendancePhotoModal({
  isOpen,
  isUploading,
  onClose,
  onSubmit
}: AttendancePhotoModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null)
      setPhotoPreview(null)
    }
  }, [isOpen])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setPhotoPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert('Silakan pilih foto terlebih dahulu')
      return
    }

    await onSubmit(selectedFile)
  }

  const handleClose = () => {
    if (!isUploading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Camera className="text-blue-600" />
            Upload Bukti Foto Absensi
          </h3>
          <button
            onClick={handleClose}
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
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              disabled={isUploading}
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
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
  )
}