"use client"

import React from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { CheckCircle, AlertCircle, Wallet } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import SalaryStatCard from '@/components/Salary/SalaryStatCard'
import SalaryFilters from '@/components/Salary/SalaryFilters'
import SalaryTable from '@/components/Salary/SalaryTable'
import SalaryPayModal from '@/components/Salary/SalaryPayModal'
import SalaryViewProofModal from '@/components/Salary/SalaryViewProofModal'
import { useSalary } from '@/hooks/useSalary'
import { SalaryService } from '@/lib/salaryService'

export default function GajiMentorPage() {
    const { user } = useUser()
    const {
        // Data
        salaries,
        stats,
        month,
        year,
        
        // User info
        isMentor,
        canEdit,
        
        // Loading states
        isUploading,
        
        // Modal states
        payModalOpen,
        viewProofOpen,
        selectedSalary,
        
        // Actions
        setMonth,
        setYear,
        handleUpdateBonus,
        handlePaySalary,
        handleViewProof,
        handleRecalculate,
        handleConfirmPay,
        closePayModal,
        closeViewProofModal
    } = useSalary()

    if (!user) return null

    return (
        <DashboardLayout title={isMentor ? "Riwayat Gaji Saya" : "Penggajian Mentor"}>
            <SalaryFilters
                month={month}
                year={year}
                onMonthChange={setMonth}
                onYearChange={setYear}
                isMentor={isMentor}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <SalaryStatCard 
                    title={isMentor ? "Total Pendapatan" : "Total Gaji"} 
                    value={SalaryService.formatRupiah(isMentor ? stats.total_paid : stats.total_gaji)} 
                    subtext={isMentor ? "Diterima" : "Estimasi Pengeluaran"} 
                    colorClass="bg-[#0077AF] text-white border-blue-800" 
                    icon={Wallet}
                />
                {!isMentor && (
                    <>
                        <SalaryStatCard 
                            title="Sudah Dibayar" 
                            value={SalaryService.formatRupiah(stats.sudah_dibayar)} 
                            subtext="Lunas" 
                            colorClass="bg-green-100 text-green-800 border-green-200" 
                            icon={CheckCircle}
                        />
                        <SalaryStatCard 
                            title="Belum Dibayar" 
                            value={SalaryService.formatRupiah(stats.total_gaji - stats.sudah_dibayar)} 
                            subtext="Pending" 
                            colorClass="bg-red-50 text-red-800 border-red-200" 
                            icon={AlertCircle}
                        />
                    </>
                )}
            </div>

            <SalaryTable
                salaries={salaries}
                isMentor={isMentor}
                canEdit={canEdit}
                onUpdateBonus={handleUpdateBonus}
                onPaySalary={handlePaySalary}
                onViewProof={handleViewProof}
                onRecalculate={handleRecalculate}
            />

            <SalaryPayModal 
                isOpen={payModalOpen} 
                onClose={closePayModal}
                salaryData={selectedSalary}
                onConfirm={handleConfirmPay}
                isUploading={isUploading}
            />

            <SalaryViewProofModal
                isOpen={viewProofOpen}
                onClose={closeViewProofModal}
                imageUrl={selectedSalary?.proof_image || null}
                mentorName={selectedSalary?.mentor_name || null}
            />
        </DashboardLayout>
    )
}