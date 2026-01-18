import React from 'react'
import { Package as PackageIcon } from 'lucide-react'

export const PaketEmptyState = () => (
    <div className="bg-white p-12 text-center text-gray-400 rounded-xl border border-gray-200 shadow-sm">
        <PackageIcon size={48} className="mx-auto mb-4 opacity-50 text-[#0077AF]"/>
        <p className="text-lg font-semibold text-gray-800">Belum ada paket kelas</p>
        <p className="text-sm">Silakan tambahkan paket baru melalui tombol di atas.</p>
    </div>
)