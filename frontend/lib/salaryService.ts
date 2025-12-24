import { getSalaries, getMySalaries, saveSalaryDraft, paySalary, uploadSalaryProof, recalculateSalary } from './salaryActions'

export interface SalaryStats {
  total_gaji: number
  sudah_dibayar: number
  belum_dibayar: number
  total_paid: number
}

export interface SalaryData {
  id: string
  mentor_id: string
  mentor_name: string
  month: number
  year: number
  salary_per_session: number
  total_sessions: number
  bonus: number
  total_amount: number
  status: string
  proof_image?: string
  is_out_of_sync?: boolean
  realtime_sessions?: number
  recorded_sessions?: number
  sync_difference?: number
}

export interface SalaryResponse {
  salaries: SalaryData[]
  stats: SalaryStats
}

export class SalaryService {
  /**
   * Fetch salary data for admin/owner
   */
  static async fetchSalaries(month: number, year: number): Promise<SalaryResponse> {
    try {
      const response = await getSalaries(month, year)
      return {
        salaries: response.salaries || [],
        stats: response.stats || { total_gaji: 0, sudah_dibayar: 0, belum_dibayar: 0, total_paid: 0 }
      }
    } catch (error) {
      console.error("Failed to fetch salaries:", error)
      return {
        salaries: [],
        stats: { total_gaji: 0, sudah_dibayar: 0, belum_dibayar: 0, total_paid: 0 }
      }
    }
  }

  /**
   * Fetch salary data for mentor
   */
  static async fetchMySalaries(): Promise<SalaryResponse> {
    try {
      const response = await getMySalaries()
      return {
        salaries: response.salaries || [],
        stats: response.stats || { total_gaji: 0, sudah_dibayar: 0, belum_dibayar: 0, total_paid: 0 }
      }
    } catch (error) {
      console.error("Failed to fetch my salaries:", error)
      return {
        salaries: [],
        stats: { total_gaji: 0, sudah_dibayar: 0, belum_dibayar: 0, total_paid: 0 }
      }
    }
  }

  /**
   * Update bonus for a salary record
   */
  static async updateBonus(
    mentorId: string,
    month: number,
    year: number,
    totalSessions: number,
    salaryPerSession: number,
    bonus: number,
    deduction: number
  ): Promise<void> {
    try {
      await saveSalaryDraft({
        mentor_id: mentorId,
        month,
        year,
        total_sessions: totalSessions,
        salary_per_session: salaryPerSession,
        bonus,
        deduction
      })
    } catch (error) {
      console.error("Failed to update bonus:", error)
      throw new Error("Gagal update bonus")
    }
  }

  /**
   * Process salary payment
   */
  static async processSalaryPayment(id: string, proofFile: File): Promise<void> {
    try {
      // Upload proof image first
      const proofUrl = await uploadSalaryProof(proofFile)
      
      // Then process payment
      await paySalary(id, proofUrl)
    } catch (error) {
      console.error("Failed to process salary payment:", error)
      throw error
    }
  }

  /**
   * Recalculate salary based on current attendance
   */
  static async recalculateSalary(salaryId: string): Promise<any> {
    try {
      const result = await recalculateSalary(salaryId)
      return result
    } catch (error) {
      console.error("Failed to recalculate salary:", error)
      throw error
    }
  }

  /**
   * Format currency to Rupiah
   */
  static formatRupiah(num: number): string {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(num)
  }
}