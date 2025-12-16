// frontend/components/LoadingScreen.tsx
import React from 'react'
import Image from 'next/image' // Jika ingin pakai logo

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm transition-all duration-300">
      
      {/* Container Animasi */}
      <div className="relative flex items-center justify-center h-24 w-24">
        
        {/* Ring Luar Berputar */}
        <div className="absolute inset-0 rounded-full border-4 border-t-[#0077AF] border-r-transparent border-b-[#00558F] border-l-transparent animate-spin"></div>
        
        {/* Ring Dalam (Opposite Spin) */}
        <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-[#3DA9FB] border-b-transparent border-l-[#3DA9FB] animate-spin-slow-reverse opacity-70"></div>
        
        {/* Logo atau Icon Tengah (Opsional, ganti src dengan logo Anda) */}
        <div className="absolute inset-0 flex items-center justify-center">
             {/* Opsi A: Pakai Logo Kecil */}
             {/* <Image src="/logo-lembaga.png" alt="Logo" width={32} height={32} className="animate-pulse" /> */}
             
             {/* Opsi B: Dot Simpel (Jika tidak ada logo kecil) */}
             <div className="h-4 w-4 bg-[#0077AF] rounded-full animate-ping"></div>
        </div>
      </div>

      {/* Teks Loading */}
      <div className="mt-6 flex flex-col items-center">
        <h3 className="text-[#0077AF] font-bold text-lg tracking-wider animate-pulse">
          MIRACLE PRIVATE
        </h3>
        <p className="text-gray-400 text-xs font-medium mt-1">
          Memuat data...
        </p>
      </div>
    </div>
  )
}