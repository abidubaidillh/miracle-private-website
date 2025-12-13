import './globals.css'
import React from 'react'

export const metadata = {
  title: 'Miracle Admin'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-6xl mx-auto p-6">{children}</div>
      </body>
    </html>
  )
}
