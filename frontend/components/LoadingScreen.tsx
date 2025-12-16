// frontend/components/LoadingScreen.tsx
import React from 'react'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-300">
      {/* Animasi Spinner */}
      <div className="relative flex items-center justify-center h-24 w-24">
        <div className="absolute inset-0 rounded-full border-4 border-t-[#0077AF] border-r-transparent border-b-[#00558F] border-l-transparent animate-spin"></div>
        <div className="absolute inset-3 rounded-full border-4 border-t-transparent border-r-[#3DA9FB] border-b-transparent border-l-[#3DA9FB] animate-spin-slow-reverse opacity-80"></div>
        <div className="absolute inset-0 flex items-center justify-center">
             <div className="h-3 w-3 bg-[#0077AF] rounded-full animate-ping"></div>
        </div>
      </div>
      {/* Teks */}
      <div className="mt-8 flex flex-col items-center gap-1">
        <h3 className="text-[#0077AF] font-bold text-xl tracking-widest animate-pulse">
          MIRACLE
        </h3>
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
          Memuat Data...
        </p>
      </div>
    </div>
  )
}