import { getAuthToken } from "./auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export const getTransactions = async (type: string = 'EXPENSE') => {
    const token = getAuthToken()
    const res = await fetch(`${API_URL}/transactions?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error("Gagal mengambil data transaksi")
    return res.json()
}

export const getCategories = async (type: string = 'EXPENSE') => {
    const token = getAuthToken()
    const res = await fetch(`${API_URL}/transactions/categories?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return res.json()
}

export const createTransaction = async (data: any) => {
    const token = getAuthToken()
    const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error("Gagal menyimpan transaksi")
    return res.json()
}

export const deleteTransaction = async (id: string) => {
    const token = getAuthToken()
    const res = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error("Gagal menghapus transaksi")
    return res.json()
}