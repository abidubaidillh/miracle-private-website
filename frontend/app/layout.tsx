import './globals.css'
import React from 'react'
import { Inter } from 'next/font/google' 

// ✅ Kita aktifkan kembali Providernya
import { UserProvider } from '@/context/UserContext'; 
import { LoadingProvider } from '@/context/LoadingContext';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Miracle Private Class',
  description: 'Dashboard Admin',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen bg-[#F8F9FA] text-gray-900 m-0 p-0`}>
        
        {/* ✅ Pastikan susunan ini ada (jangan di-comment lagi) */}
        <UserProvider>
          <LoadingProvider>
             {children}
          </LoadingProvider>
        </UserProvider>

      </body>
    </html>
  )
}