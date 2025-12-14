import './globals.css'
import React from 'react'

export const metadata = {
  title: 'Miracle Admin'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gray-50 text-gray-900 m-0 p-0">
        {children}
      </body>
    </html>
  )
}
