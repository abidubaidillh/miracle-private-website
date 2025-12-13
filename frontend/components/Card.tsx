import React from 'react'

export default function Card({ title, children }: { title?: string, children: React.ReactNode }){
  return (
    <div className="border rounded-lg bg-white p-4 shadow-sm">
      {title && <h3 className="font-semibold mb-2">{title}</h3>}
      <div>{children}</div>
    </div>
  )
}
