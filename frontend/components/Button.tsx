// components/Button.tsx (SUDAH DIPERBAIKI)
"use client"

import React, { ButtonHTMLAttributes } from 'react' // Import ButtonHTMLAttributes untuk inklusi props HTML standar

// Ubah 'type Props' menjadi interface yang diperluas dari ButtonHTMLAttributes
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    // properti lain seperti onClick, type, className, style, disabled sudah termasuk di ButtonHTMLAttributes
    // Kita hapus properti yang sudah ada di ButtonHTMLAttributes untuk menghindari duplikasi
    className?: string
    style?: React.CSSProperties
}

export default function Button({ children, onClick, type = 'button', className = '', style = {}, disabled = false, ...rest }: ButtonProps) {
    const defaultStyle = {
        width: 200, // Ini akan ditimpa oleh Tailwind di Modal/Page
        height: 60, // Ini akan ditimpa oleh Tailwind di Modal/Page
        backgroundColor: '#00558F',
        border: 'none',
    }
    
    // Kelas untuk menangani state disabled
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90';


    return (
        <button
            type={type}
            onClick={onClick}
            // Meneruskan prop 'disabled' dan prop HTML lainnya melalui ...rest
            disabled={disabled} 
            className={`inline-flex items-center justify-center text-white font-semibold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#0077AF] ${className} ${disabledClass}`}
            style={{
                ...defaultStyle,
                ...style,
            }}
            {...rest}
        >
            {children}
        </button>
    )
}