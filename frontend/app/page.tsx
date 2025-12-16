import { redirect } from 'next/navigation'

export default function Home() {
  // Secara default, paksa redirect ke login.
  // Middleware akan menangkap request ini sebelum render:
  // 1. Jika user sudah login -> Middleware membelokkan ke /dashboard
  // 2. Jika user belum login -> Middleware membiarkan redirect ini atau mengarahkannya sendiri ke /login
  redirect('/login')
}