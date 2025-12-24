"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useLoading } from '@/context/LoadingContext'
import { useUser } from '@/context/UserContext'
import Swal from 'sweetalert2'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  Tag,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface Kategori {
  id: string
  nama_kategori: string
  deskripsi?: string
}

interface OperasionalData {
  id: string
  nama_pengeluaran: string
  kategori_id: string
  jumlah: number
  tipe_periode: 'HARIAN' | 'MINGGUAN' | 'BULANAN'
  tanggal: string
  deskripsi?: string
  kategori_operasional?: Kategori
  created_at: string
}

interface Summary {
  totalBulanIni: number
  perKategori: Record<string, number>
  periode: string
}

export default function BiayaOperasionalPage() {
  const { withLoading } = useLoading()
  const { user } = useUser()
  
  const [operasionalList, setOperasionalList] = useState<OperasionalData[]>([])
  const [kategoriList, setKategoriList] = useState<Kategori[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterKategori, setFilterKategori] = useState('')
  const [filterTipePeriode, setFilterTipePeriode] = useState('')
  const [filterBulan, setFilterBulan] = useState('')
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear().toString())
  
  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<OperasionalData | null>(null)
  const [formData, setFormData] = useState({
    nama_pengeluaran: '',
    kategori_id: '',
    jumlah: '',
    tipe_periode: 'HARIAN' as 'HARIAN' | 'MINGGUAN' | 'BULANAN',
    tanggal: new Date().toISOString().split('T')[0],
    deskripsi: ''
  })

  // Check permissions
  const canEdit = user?.role === 'OWNER' || user?.role === 'BENDAHARA'

  // Fetch data
  const fetchData = async () => {
    await withLoading(async () => {
      try {
        const params = new URLSearchParams()
        if (filterKategori) params.append('kategori', filterKategori)
        if (filterTipePeriode) params.append('tipe_periode', filterTipePeriode)
        if (filterBulan) params.append('bulan', filterBulan)
        if (filterTahun) params.append('tahun', filterTahun)
        
        const [operasionalRes, kategoriRes, summaryRes] = await Promise.all([
          fetch(`${API}/api/operasional?${params.toString()}`, {
            credentials: 'include'
          }),
          fetch(`${API}/api/operasional/kategori`, {
            credentials: 'include'
          }),
          fetch(`${API}/api/operasional/summary`, {
            credentials: 'include'
          })
        ])

        if (!operasionalRes.ok || !kategoriRes.ok || !summaryRes.ok) {
          throw new Error('Gagal mengambil data')
        }

        const operasionalData = await operasionalRes.json()
        const kategoriData = await kategoriRes.json()
        const summaryData = await summaryRes.json()

        setOperasionalList(operasionalData.data || [])
        setKategoriList(kategoriData.data || [])
        setSummary(summaryData)

      } catch (error: any) {
        console.error('Error fetching data:', error)
        Swal.fire('Error', 'Gagal memuat data biaya operasional', 'error')
      }
    })
  }

  useEffect(() => {
    fetchData()
  }, [filterKategori, filterTipePeriode, filterBulan, filterTahun])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canEdit) {
      Swal.fire('Akses Ditolak', 'Anda tidak memiliki izin untuk menambah/edit data', 'error')
      return
    }

    await withLoading(async () => {
      try {
        const url = editingItem 
          ? `${API}/api/operasional/${editingItem.id}`
          : `${API}/api/operasional`
        
        const method = editingItem ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            ...formData,
            jumlah: parseFloat(formData.jumlah)
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Gagal menyimpan data')
        }

        Swal.fire('Berhasil', `Data berhasil ${editingItem ? 'diupdate' : 'ditambahkan'}`, 'success')
        setShowModal(false)
        resetForm()
        fetchData()

      } catch (error: any) {
        Swal.fire('Error', error.message, 'error')
      }
    })
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!canEdit) {
      Swal.fire('Akses Ditolak', 'Anda tidak memiliki izin untuk menghapus data', 'error')
      return
    }

    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: 'Apakah Anda yakin ingin menghapus data ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    })

    if (result.isConfirmed) {
      await withLoading(async () => {
        try {
          const response = await fetch(`${API}/api/operasional/${id}`, {
            method: 'DELETE',
            credentials: 'include'
          })

          if (!response.ok) {
            throw new Error('Gagal menghapus data')
          }

          Swal.fire('Berhasil', 'Data berhasil dihapus', 'success')
          fetchData()

        } catch (error: any) {
          Swal.fire('Error', error.message, 'error')
        }
      })
    }
  }

  // Handle edit
  const handleEdit = (item: OperasionalData) => {
    if (!canEdit) {
      Swal.fire('Akses Ditolak', 'Anda tidak memiliki izin untuk mengedit data', 'error')
      return
    }

    setEditingItem(item)
    setFormData({
      nama_pengeluaran: item.nama_pengeluaran,
      kategori_id: item.kategori_id,
      jumlah: item.jumlah.toString(),
      tipe_periode: item.tipe_periode,
      tanggal: item.tanggal,
      deskripsi: item.deskripsi || ''
    })
    setShowModal(true)
  }

  // Reset form
  const resetForm = () => {
    setEditingItem(null)
    setFormData({
      nama_pengeluaran: '',
      kategori_id: '',
      jumlah: '',
      tipe_periode: 'HARIAN',
      tanggal: new Date().toISOString().split('T')[0],
      deskripsi: ''
    })
  }

  // Filter data
  const filteredData = operasionalList.filter(item => {
    const matchSearch = item.nama_pengeluaran.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.kategori_operasional?.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase())
    return matchSearch
  })

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <DashboardLayout title="Biaya Operasional">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Total Bulan Ini</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalBulanIni)}</p>
                <p className="text-red-100 text-xs mt-1">{summary.periode}</p>
              </div>
              <TrendingUp size={32} className="text-red-200" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Per Kategori</h3>
              <Tag size={20} className="text-gray-400" />
            </div>
            <div className="space-y-2">
              {Object.entries(summary.perKategori).slice(0, 3).map(([kategori, jumlah]) => (
                <div key={kategori} className="flex justify-between text-sm">
                  <span className="text-gray-600">{kategori}</span>
                  <span className="font-medium">{formatCurrency(jumlah)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Data</p>
                <p className="text-2xl font-bold text-gray-800">{operasionalList.length}</p>
                <p className="text-gray-500 text-xs mt-1">Entri biaya</p>
              </div>
              <DollarSign size={32} className="text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama biaya atau kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077AF] focus:border-transparent"
              />
            </div>
          </div>
          
          {canEdit && (
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="bg-[#0077AF] text-white px-4 py-2 rounded-lg hover:bg-[#005a8a] transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Tambah Biaya
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077AF]"
          >
            <option value="">Semua Kategori</option>
            {kategoriList.map(kategori => (
              <option key={kategori.id} value={kategori.id}>
                {kategori.nama_kategori}
              </option>
            ))}
          </select>

          <select
            value={filterTipePeriode}
            onChange={(e) => setFilterTipePeriode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077AF]"
          >
            <option value="">Semua Periode</option>
            <option value="HARIAN">Harian</option>
            <option value="MINGGUAN">Mingguan</option>
            <option value="BULANAN">Bulanan</option>
          </select>

          <select
            value={filterBulan}
            onChange={(e) => setFilterBulan(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077AF]"
          >
            <option value="">Semua Bulan</option>
            {Array.from({length: 12}, (_, i) => (
              <option key={i+1} value={i+1}>
                {new Date(0, i).toLocaleString('id-ID', {month: 'long'})}
              </option>
            ))}
          </select>

          <select
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077AF]"
          >
            {Array.from({length: 5}, (_, i) => {
              const year = new Date().getFullYear() - 2 + i
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0077AF] text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Tanggal</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Nama Biaya</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Kategori</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Periode</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Jumlah</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Deskripsi</th>
                {canEdit && (
                  <th className="px-6 py-4 text-center text-sm font-semibold">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                    <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="font-medium">Tidak ada data biaya operasional</p>
                    <p className="text-sm mt-1">Silakan tambah data baru atau ubah filter</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(item.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.nama_pengeluaran}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.kategori_operasional?.nama_kategori || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.tipe_periode === 'HARIAN' ? 'bg-blue-100 text-blue-800' :
                        item.tipe_periode === 'MINGGUAN' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {item.tipe_periode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-right text-red-600">
                      {formatCurrency(item.jumlah)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.deskripsi || '-'}
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingItem ? 'Edit Biaya Operasional' : 'Tambah Biaya Operasional'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Pengeluaran *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama_pengeluaran}
                    onChange={(e) => setFormData({...formData, nama_pengeluaran: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077AF]"
                    placeholder="Contoh: Listrik, Internet, ATK"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    required
                    value={formData.kategori_id}
                    onChange={(e) => setFormData({...formData, kategori_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077AF]"
                  >
                    <option value="">Pilih Kategori</option>
                    {kategoriList.map(kategori => (
                      <option key={kategori.id} value={kategori.id}>
                        {kategori.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={formData.jumlah}
                    onChange={(e) => setFormData({...formData, jumlah: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077AF]"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Periode *
                  </label>
                  <select
                    required
                    value={formData.tipe_periode}
                    onChange={(e) => setFormData({...formData, tipe_periode: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077AF]"
                  >
                    <option value="HARIAN">Harian</option>
                    <option value="MINGGUAN">Mingguan</option>
                    <option value="BULANAN">Bulanan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077AF]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077AF]"
                    rows={3}
                    placeholder="Keterangan tambahan (opsional)"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#0077AF] text-white rounded-lg hover:bg-[#005a8a]"
                  >
                    {editingItem ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}