import React from 'react'

export default function Button({ children, className = '' }: { children: React.ReactNode, className?: string }){
  return (
    <button className={`btn ${className}`}>{children}</button>
  )
}
