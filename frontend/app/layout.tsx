// frontend/app/layout.tsx
import './globals.css'
import React from 'react'
import { UserProvider } from '@/context/UserContext'; 
import { Inter } from 'next/font/google' // Import Font Inter

// Konfigurasi Font
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Miracle Private Class',
  description: 'Dashboard Admin',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      {/* PERUBAHAN PENTING:
        1. bg-[#F8F9FA]: Disamakan dengan background DashboardLayout agar tidak belang.
        2. m-0 p-0: Menghapus margin bawaan browser (penyebab header tidak mentok).
        3. inter.className: Menerapkan font global.
      */}
      <body className={`${inter.className} min-h-screen bg-[#F8F9FA] text-gray-900 m-0 p-0`}>
        <UserProvider> 
          {children}
        </UserProvider>
      </body>
    </html>
  )
}