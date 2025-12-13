import React from 'react'

export default function SimpleTable({ columns, data }: { columns: string[], data: string[][] }){
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((c, i) => <th key={i} className="text-left px-4 py-2">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, r) => (
            <tr key={r} className="border-t">
              {row.map((cell, c) => <td key={c} className="px-4 py-2">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
