const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// Helper ambil token (bisa dipisah ke file util)
const getHeaders = () => {
    let token = '';
    if (typeof document !== 'undefined') {
        const match = document.cookie.match(new RegExp('(^| )auth=([^;]+)'));
        if (match) {
            try {
                const authData = JSON.parse(decodeURIComponent(match[2]));
                token = authData.session.access_token;
            } catch (e) {}
        }
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    }
}

export const getPayments = async (search = '', status = '') => {
    const query = new URLSearchParams({ search, status }).toString()
    const res = await fetch(`${API_URL}/api/payments?${query}`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Gagal mengambil data pembayaran')
    return res.json()
}

export const createPayment = async (data: any) => {
    const res = await fetch(`${API_URL}/api/payments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Gagal menyimpan pembayaran')
    return res.json()
}

export const deletePayment = async (id: string) => {
    const res = await fetch(`${API_URL}/api/payments/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    })
    if (!res.ok) throw new Error('Gagal menghapus pembayaran')
    return res.json()
}