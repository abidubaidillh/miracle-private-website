import React from 'react'
import Button from '../../components/Button'
import Card from '../../components/Card'

export default function DashboardPage(){
  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <Button>Contoh Button</Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Ringkasan">Ini adalah card contoh.</Card>
        <Card title="Statistik">Card kedua contoh.</Card>
      </div>
    </main>
  )
}
