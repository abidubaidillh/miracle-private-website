"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import LoadingScreen from "@/components/LoadingScreen" 

interface LoadingContextType {
  isLoading: boolean
  showLoading: () => void
  hideLoading: () => void
  withLoading: (fn: () => Promise<any>) => Promise<any>
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

// ✅ Pastikan pakai 'export function' (Bukan export default)
export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  const showLoading = () => setIsLoading(true)
  const hideLoading = () => setIsLoading(false)

  const withLoading = async (fn: () => Promise<any>) => {
    try {
      setIsLoading(true)
      await fn()
    } finally {
      setTimeout(() => setIsLoading(false), 300) 
    }
  }

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading, withLoading }}>
      {isLoading && <LoadingScreen />}
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider")
  }
  return context
}