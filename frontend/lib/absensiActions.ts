// frontend/lib/absensiActions.ts

const API_ATTENDANCE_URL = 'http://localhost:4000/api/attendance';

export async function getAttendance(filters: any = {}) {
  const params = new URLSearchParams();
  if (filters.date) params.append('date', filters.date);
  if (filters.mentor_id) params.append('mentor_id', filters.mentor_id);
  // Tambahkan filter lain jika perlu

  const res = await fetch(`${API_ATTENDANCE_URL}?${params}`, { 
    cache: 'no-store',
    credentials: 'include' 
  });

  if (!res.ok) throw new Error('Gagal mengambil data absensi');
  return res.json();
}

export async function submitAttendance(data: any) {
  const res = await fetch(API_ATTENDANCE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Gagal submit absensi');
  }
  return res.json();
}