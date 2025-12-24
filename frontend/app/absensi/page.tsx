"use client"

import React from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useUser } from '@/context/UserContext'
import AttendanceTable from '@/components/Attendance/AttendanceTable'
import AttendanceFilters from '@/components/Attendance/AttendanceFilters'
import AttendancePhotoModal from '@/components/Attendance/AttendancePhotoModal'
import { useAttendance } from '@/hooks/useAttendance'

export default function AbsensiPage() {
    const { user } = useUser()
    const {
        // Data
        schedules,
        month,
        year,
        
        // Loading states
        isUploading,
        
        // Modal states
        showPhotoModal,
        
        // Actions
        setMonth,
        setYear,
        handleAttendanceSubmit,
        handlePhotoSubmit,
        closePhotoModal
    } = useAttendance()

    if (!user) return null

    return (
        <DashboardLayout title="Absensi Kelas">
            <AttendanceFilters
                month={month}
                year={year}
                onMonthChange={setMonth}
                onYearChange={setYear}
                userRole={user.role}
                userName={user.name}
            />

            <AttendanceTable 
                schedules={schedules}
                onAttendanceSubmit={handleAttendanceSubmit}
                userRole={user.role}
                isLoading={false}
            />

            <AttendancePhotoModal
                isOpen={showPhotoModal}
                isUploading={isUploading}
                onClose={closePhotoModal}
                onSubmit={handlePhotoSubmit}
            />
        </DashboardLayout>
    )
}