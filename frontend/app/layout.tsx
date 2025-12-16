// frontend/app/layout.tsx
import './globals.css'
import React from 'react'
import { UserProvider } from '@/context/UserContext'; 
import { Inter } from 'next/font/google' 
import { LoadingProvider } from "@/context/LoadingContext" // ✅ 1. Import

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Miracle Private Class',
  description: 'Dashboard Admin',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen bg-[#F8F9FA] text-gray-900 m-0 p-0`}>
        
        {/* ✅ 2. Provider disusun bertingkat (Nesting) */}
        <UserProvider>
          <LoadingProvider>
             {children}
          </LoadingProvider>
        </UserProvider>

      </body>
    </html>
  )
}