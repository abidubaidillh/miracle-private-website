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
          background: '#F8F9FA',
          surface: '#FFFFFF',
          text: '#1F2937',
          'text-secondary': '#6B7280',
        }
      },

      // 2. Font Family yang konsisten
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },

      // 3. Spacing yang lebih terukur
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },

      // 4. Border radius yang konsisten
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },

      // 5. Box shadow yang lebih profesional
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'hard': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'inner-soft': 'inset 0 2px 4px rgba(0, 0, 0, 0.02)',
      },

      // 6. Definisi Gerakan Animasi Custom
      keyframes: {
        // Gerakan berputar berlawanan arah jarum jam (Counter-Clockwise)
        'spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },

      // 7. Nama Class Animasi yang bisa dipakai di HTML
      animation: {
        // Cara pakai: className="animate-spin-slow-reverse"
        // Durasi: 3 detik (lebih lambat & elegan untuk loading screen)
        'spin-slow-reverse': 'spin-reverse 3s linear infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
