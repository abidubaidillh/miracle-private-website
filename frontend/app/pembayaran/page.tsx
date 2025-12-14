"use client"

import React from 'react'
import DashboardLayout from '@/components/DashboardLayout'

export default function PembayaranPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1
          className="text-white font-normal mb-8"
          style={{
            fontFamily: 'Inter',
            fontSize: '24px',
            fontWeight: 400,
          }}
        >
          Pembayaran
        </h1>
        <p className="text-gray-600">Halaman pembayaran (kosong)</p>
      </div>
    </DashboardLayout>
  )
}
