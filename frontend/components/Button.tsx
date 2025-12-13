"use client"

import React from 'react'

type Props = {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export default function Button({ children, onClick, type = 'button', className = '' }: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center text-white font-semibold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#0077AF] ${className}`}
      style={{
        width: 200,
        height: 60,
        backgroundColor: '#00558F',
        border: 'none',
      }}
    >
      {children}
    </button>
  )
}
