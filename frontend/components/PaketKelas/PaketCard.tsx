"use client"

import React from 'react'
import { Pencil, Trash2, Package as PackageIcon, BookOpen } from 'lucide-react'
import { Package } from '@/lib/packageActions'

interface PaketCardProps {
    paket: Package
    canEdit: boolean
    onEdit: (paket: Package) => void
    onDelete: (id: string, name: string) => void
    formatRupiah: (num: number) => string
    getPricePerSession: (price: number, duration: string) => string | null
}

export const PaketCard = ({ 
    paket, canEdit, onEdit, onDelete, formatRupiah, getPricePerSession 
}: PaketCardProps) => {
    const pricePerSessionStr = getPricePerSession(paket.price, paket.duration);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between w-full h-[225px] hover:shadow-md transition-all relative overflow-hidden group">
            {/* Hiasan background */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 text-[#0077AF] opacity-[0.05] group-hover:opacity-[0.08] transition-opacity">
                <PackageIcon size={120} />
            </div>

            <div>
                <div className="flex justify-between items-start mb-3 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg text-[#0077AF]">
                            <BookOpen size={20} />
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg line-clamp-1" title={paket.name}>
                            {paket.name}
                        </h3>
                    </div>
                    <span className="bg-gray-100 text-gray-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-gray-200">
                        {paket.duration}
                    </span>
                </div>

                <p className="text-gray-500 text-sm line-clamp-2 mb-4 relative z-10 italic">
                    {paket.description || "Tersedia untuk semua jenjang pendidikan."}
                </p>
            </div>

            <div className="relative z-10">
                <div className="mb-4">
                    <div className="text-2xl font-black text-[#0077AF]">
                        {formatRupiah(paket.price)}
                    </div>
                    {pricePerSessionStr && (
                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                            Estimasi: {pricePerSessionStr}
                        </div>
                    )}
                </div>

                {canEdit && (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => onEdit(paket)} 
                            className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold py-2 rounded-lg flex items-center justify-center transition-colors"
                        >
                            <Pencil size={14} className="mr-1.5 text-yellow-600" /> Edit
                        </button>
                        <button 
                            onClick={() => onDelete(paket.id, paket.name)} 
                            className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold py-2 rounded-lg flex items-center justify-center transition-colors"
                        >
                            <Trash2 size={14} className="mr-1.5" /> Hapus
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}