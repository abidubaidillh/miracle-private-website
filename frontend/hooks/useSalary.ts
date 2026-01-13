import { useState, useEffect } from 'react'
import { useUser } from '@/context/UserContext'
import { useLoading } from '@/context/LoadingContext'
import { SalaryService, SalaryData, SalaryStats } from '@/lib/salaryService'

export interface UseSalaryReturn {
  // Data
  salaries: SalaryData[]
  stats: SalaryStats
  month: number
  year: number
  
  // User info
  isMentor: boolean
  canEdit: boolean
  
  // Loading states
  isUploading: boolean
  
  // Modal states
  payModalOpen: boolean
  viewProofOpen: boolean
  selectedSalary: SalaryData | null
  
  // Actions
  setMonth: (month: number) => void
  setYear: (year: number) => void
  handleUpdateBonus: (item: SalaryData, newBonus: string) => void
  handlePaySalary: (salary: SalaryData) => void
  handleViewProof: (salary: SalaryData) => void
  handleRecalculate: (salaryId: string, mentorName: string) => void
  handleConfirmPay: (id: string, proofFile: File) => Promise<void>
  closePayModal: () => void
  closeViewProofModal: () => void
  refreshData: () => Promise<void>
}

export function useSalary(): UseSalaryReturn {
  const { user } = useUser()
  const { withLoading } = useLoading()
  
  // Filter states
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  
  // Data states
  const [salaries, setSalaries] = useState<SalaryData[]>([])
  const [stats, setStats] = useState<SalaryStats>({ 
    total_gaji: 0, 
    sudah_dibayar: 0, 
    belum_dibayar: 0, 
    total_paid: 0 
  })
  
  // Modal states
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [viewProofOpen, setViewProofOpen] = useState(false)
  const [selectedSalary, setSelectedSalary] = useState<SalaryData | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // User role checks
  const role = user?.role || ''
  const isMentor = role === 'MENTOR'
  const canEdit = ['OWNER', 'BENDAHARA'].includes(role)

  // Fetch data function
  const fetchData = async () => {
    if (!user) return

    await withLoading(async () => {
      try {
        let response
        if (isMentor) {
          response = await SalaryService.fetchMySalaries()
        } else {
          response = await SalaryService.fetchSalaries(month, year)
        }
        
        setSalaries(response.salaries)
        setStats(response.stats)
      } catch (error) {
        console.error("Failed to fetch salary data:", error)
        setSalaries([])
        setStats({ total_gaji: 0, sudah_dibayar: 0, belum_dibayar: 0, total_paid: 0 })
      }
    })
  }

  // Load data when user or filters change
  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, month, year])

  // Handle bonus update
  const handleUpdateBonus = async (item: SalaryData, newBonus: string) => {
    const cleanBonus = parseInt(newBonus.replace(/\D/g, '')) || 0
    if (cleanBonus === item.bonus) return

    await withLoading(async () => {
      try {
        await SalaryService.updateBonus(
          item.mentor_id,
          month,
          year,
          item.total_sessions,
          item.salary_per_session,
          cleanBonus,
          0 // deduction - could be made configurable
        )
        await fetchData()
      } catch (error) {
        alert("Gagal update bonus")
      }
    })
  }

  // Handle pay salary
  const handlePaySalary = (salary: SalaryData) => {
    setSelectedSalary(salary)
    setPayModalOpen(true)
  }

  // Handle view proof
  const handleViewProof = (salary: SalaryData) => {
    if (!salary.proof_image) {
      alert("Bukti transfer tidak ditemukan.")
      return
    }
    setSelectedSalary(salary)
    setViewProofOpen(true)
  }

  // Handle recalculate
  const handleRecalculate = async (salaryId: string, mentorName: string) => {
    if (!confirm(`Recalculate gaji ${mentorName}? Data akan diperbarui sesuai absensi terkini.`)) return

    await withLoading(async () => {
      try {
        const result = await SalaryService.recalculateSalary(salaryId)
        alert(`Recalculate berhasil!\nSesi lama: ${result.old_sessions} → Sesi baru: ${result.new_sessions}`)
        await fetchData()
      } catch (error: any) {
        alert("Gagal recalculate: " + error.message)
      }
    })
  }

  // Handle confirm payment
  const handleConfirmPay = async (id: string, proofFile: File) => {
    if (!id || !proofFile) {
      alert("Data pembayaran atau file bukti tidak ditemukan.")
      return
    }

    setIsUploading(true)

    try {
      // If the ID looks like a mentor ID (no salary record exists yet), 
      // we need to save the salary as a draft first
      let salaryId = id
      
      // Check if this is likely a mentor ID (by checking if we have selectedSalary with null id)
      if (selectedSalary && !selectedSalary.id) {
        // This is a virtual salary record, need to save it as draft first
        try {
          await SalaryService.updateBonus(
            selectedSalary.mentor_id,
            month,
            year,
            selectedSalary.total_sessions,
            selectedSalary.salary_per_session,
            selectedSalary.bonus || 0,
            0 // deduction
          )
          
          // Refresh data to get the new salary ID
          await fetchData()
          
          // Find the newly created salary record
          const updatedSalaries = await SalaryService.fetchSalaries(month, year)
          const newSalary = updatedSalaries.salaries.find(
            (s: SalaryData) => 
              s.mentor_id === selectedSalary.mentor_id && 
              s.month === month && 
              s.year === year
          )
          
          if (newSalary && newSalary.id) {
            salaryId = newSalary.id
          } else {
            throw new Error("Gagal membuat draft gaji. Silakan coba lagi.")
          }
        } catch (draftError: any) {
          console.error("Failed to save salary draft:", draftError)
          throw new Error("Gagal menyimpan draft gaji: " + draftError.message)
        }
      }

      // Now process payment with the valid salary ID
      await SalaryService.processSalaryPayment(salaryId, proofFile)
      
      // Close modal and refresh data
      setPayModalOpen(false)
      setSelectedSalary(null)
      await fetchData()
      
      alert("Pembayaran Berhasil Dicatat")
    } catch (error: any) {
      console.error("Failed to process payment:", error)
      alert("Gagal memproses pembayaran: " + (error.message || "Terjadi kesalahan sistem"))
    } finally {
      setIsUploading(false)
    }
  }

  // Close modals
  const closePayModal = () => {
    setPayModalOpen(false)
    setSelectedSalary(null)
  }

  const closeViewProofModal = () => {
    setViewProofOpen(false)
    setSelectedSalary(null)
  }

  // Refresh data
  const refreshData = fetchData

  return {
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
    closeViewProofModal,
    refreshData
  }
}
