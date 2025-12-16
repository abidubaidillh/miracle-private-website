// frontend/context/LoadingContext.tsx
"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import LoadingScreen from "@/components/LoadingScreen" // Import komponen loading cantik tadi

interface LoadingContextType {
  isLoading: boolean
  showLoading: () => void
  hideLoading: () => void
  // Fungsi ajaib untuk membungkus aksi async otomatis
  withLoading: (fn: () => Promise<any>) => Promise<any>
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  const showLoading = () => setIsLoading(true)
  const hideLoading = () => setIsLoading(false)

  /**
   * Helper function agar tidak perlu manual set loading true/false
   * Cara pakai: await withLoading(async () => { ... })
   */
  const withLoading = async (fn: () => Promise<any>) => {
    try {
      setIsLoading(true)
      await fn() // Jalankan fungsi aksi
    } finally {
      // Delay sedikit biar animasinya tidak 'kaget' kalau prosesnya terlalu cepat
      setTimeout(() => setIsLoading(false), 300) 
    }
  }

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading, withLoading }}>
      {/* Jika isLoading true, LoadingScreen muncul di atas semua konten */}
      {isLoading && <LoadingScreen />}
      {children}
    </LoadingContext.Provider>
  )
}

// Custom Hook agar mudah dipanggil
export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider")
  }
  return context
}