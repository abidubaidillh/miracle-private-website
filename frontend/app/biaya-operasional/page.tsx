"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useLoading } from '@/context/LoadingContext'
import { useUser } from '@/context/UserContext'
import Swal from 'sweetalert2'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  DollarSign,
  Tag,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

// Import service yang sudah menggunakan fetchWithAuth
import { 
  getOperasionalData, 
  getKategoriOperasional, 
  getOperasionalSummary,
  API_URL_BASE // Pastikan ini diekspor dari financeActions atau auth
} from '@/lib/financeActions'
import { fetchWithAuth } from '@/lib/apiClient'

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

  const canEdit = user?.role === 'OWNER' || user?.role === 'BENDAHARA'

  // Fetch data menggunakan financeActions
  const fetchData = async () => {
    await withLoading(async () => {
      try {
        const params = new URLSearchParams()
        if (filterKategori) params.append('kategori', filterKategori)
        if (filterTipePeriode) params.append('tipe_periode', filterTipePeriode)
        if (filterBulan) params.append('bulan', filterBulan)
        if (filterTahun) params.append('tahun', filterTahun)
        
        const [operasionalRes, kategoriRes, summaryRes] = await Promise.all([
          getOperasionalData(params.toString()),
          getKategoriOperasional(),
          getOperasionalSummary()
        ])

        setOperasionalList(operasionalRes.data || [])
        setKategoriList(kategoriRes.data || [])
        setSummary(summaryRes)

      } catch (error: any) {
        console.error('Error fetching data:', error)
        if (error.message !== 'SESSION_EXPIRED') {
            Swal.fire('Error', 'Gagal memuat data biaya operasional', 'error')
        }
      }
    })
  }

  useEffect(() => {
    fetchData()
  }, [filterKategori, filterTipePeriode, filterBulan, filterTahun])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit) return

    await withLoading(async () => {
      try {
        const url = editingItem 
          ? `${API_URL_BASE}/operasional/${editingItem.id}`
          : `${API_URL_BASE}/operasional`
        
        const method = editingItem ? 'PUT' : 'POST'
        
        const response = await fetchWithAuth(url, {
          method,
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
        if (error.message !== 'SESSION_EXPIRED') {
            Swal.fire('Error', error.message, 'error')
        }
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!canEdit) return

    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: 'Apakah Anda yakin ingin menghapus data ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus'
    })

    if (result.isConfirmed) {
      await withLoading(async () => {
        try {
          const response = await fetchWithAuth(`${API_URL_BASE}/operasional/${id}`, {
            method: 'DELETE'
          })

          if (!response.ok) throw new Error('Gagal menghapus data')

          Swal.fire('Berhasil', 'Data berhasil dihapus', 'success')
          fetchData()
        } catch (error: any) {
          if (error.message !== 'SESSION_EXPIRED') {
            Swal.fire('Error', error.message, 'error')
          }
        }
      })
    }
  }

  const handleEdit = (item: OperasionalData) => {
    if (!canEdit) return
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

  const filteredData = operasionalList.filter(item => {
    const searchLower = searchTerm.toLowerCase()
    return item.nama_pengeluaran.toLowerCase().includes(searchLower) ||
           item.kategori_operasional?.nama_kategori.toLowerCase().includes(searchLower)
  })

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
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Total Bulan Ini</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalBulanIni)}</p>
                <p className="text-red-100 text-xs mt-1">{summary.periode}</p>
              </div>
              <TrendingUp size={32} className="text-red-200 opacity-50" />
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
              <DollarSign size={32} className="text-gray-400 opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex-1 min-w-[280px]">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari biaya atau kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077AF] outline-none"
              />
            </div>
          </div>
          
          {canEdit && (
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="bg-[#0077AF] text-white px-4 py-2 rounded-lg hover:bg-[#005a8a] transition-colors flex items-center gap-2"
            >
              <Plus size={20} /> Tambah Biaya
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0077AF]"
          >
            <option value="">Semua Kategori</option>
            {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama_kategori}</option>)}
          </select>

          <select
            value={filterTipePeriode}
            onChange={(e) => setFilterTipePeriode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
          >
            <option value="">Semua Periode</option>
            <option value="HARIAN">Harian</option>
            <option value="MINGGUAN">Mingguan</option>
            <option value="BULANAN">Bulanan</option>
          </select>

          <select
            value={filterBulan}
            onChange={(e) => setFilterBulan(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
          >
            <option value="">Semua Bulan</option>
            {Array.from({length: 12}, (_, i) => (
              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('id-ID', {month: 'long'})}</option>
            ))}
          </select>

          <select
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
          >
            {Array.from({length: 5}, (_, i) => {
              const year = new Date().getFullYear() - 2 + i
              return <option key={year} value={year}>{year}</option>
            })}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0077AF] text-white">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold">Tanggal</th>
                <th className="px-6 py-4 text-sm font-semibold">Nama Biaya</th>
                <th className="px-6 py-4 text-sm font-semibold">Kategori</th>
                <th className="px-6 py-4 text-sm font-semibold">Periode</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Jumlah</th>
                <th className="px-6 py-4 text-sm font-semibold">Deskripsi</th>
                {canEdit && <th className="px-6 py-4 text-center text-sm font-semibold">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 7 : 6} className="px-6 py-12 text-center text-gray-400">
                    <AlertCircle size={40} className="mx-auto mb-2 opacity-20" />
                    Data tidak ditemukan
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nama_pengeluaran}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.kategori_operasional?.nama_kategori || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.tipe_periode === 'HARIAN' ? 'bg-blue-100 text-blue-700' :
                        item.tipe_periode === 'MINGGUAN' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {item.tipe_periode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-right text-red-600">{formatCurrency(item.jumlah)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 italic">{item.deskripsi || '-'}</td>
                    {canEdit && (
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
                {editingItem ? 'Edit Biaya' : 'Tambah Biaya Baru'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Pengeluaran *</label>
                  <input
                    type="text" required
                    value={formData.nama_pengeluaran}
                    onChange={(e) => setFormData({...formData, nama_pengeluaran: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077AF] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kategori *</label>
                    <select
                      required value={formData.kategori_id}
                      onChange={(e) => setFormData({...formData, kategori_id: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                    >
                      <option value="">Pilih...</option>
                      {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama_kategori}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Periode *</label>
                    <select
                      required value={formData.tipe_periode}
                      onChange={(e) => setFormData({...formData, tipe_periode: e.target.value as any})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                    >
                      <option value="HARIAN">Harian</option>
                      <option value="MINGGUAN">Mingguan</option>
                      <option value="BULANAN">Bulanan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Jumlah (Rp) *</label>
                  <input
                    type="number" required min="0"
                    value={formData.jumlah}
                    onChange={(e) => setFormData({...formData, jumlah: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-[#0077AF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tanggal *</label>
                  <input
                    type="date" required
                    value={formData.tanggal}
                    onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Deskripsi</label>
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl resize-none"
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#0077AF] text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-[#005a8a] transition-all"
                  >
                    {editingItem ? 'Simpan Perubahan' : 'Simpan Data'}
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