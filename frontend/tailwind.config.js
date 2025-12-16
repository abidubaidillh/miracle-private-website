/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Pastikan path ini mencakup semua file tempat Anda menulis class Tailwind
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    
    // Jika Anda menggunakan folder 'src', baris ini sangat penting:
    './src/**/*.{js,ts,jsx,tsx}', 
  ],
  theme: {
    extend: {
      // 1. Palet Warna Brand (Opsional, agar koding lebih rapi)
      colors: {
        miracle: {
          blue: '#0077AF',    // Warna Utama
          dark: '#00558F',    // Warna Hover Button
          light: '#3DA9FB',   // Warna Aksen/Muda
        }
      },

      // 2. Definisi Gerakan Animasi Custom
      keyframes: {
        // Gerakan berputar berlawanan arah jarum jam (Counter-Clockwise)
        'spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
      },

      // 3. Nama Class Animasi yang bisa dipakai di HTML
      animation: {
        // Cara pakai: className="animate-spin-slow-reverse"
        // Durasi: 3 detik (lebih lambat & elegan untuk loading screen)
        'spin-slow-reverse': 'spin-reverse 3s linear infinite',
      },
    },
  },
  plugins: [],
}