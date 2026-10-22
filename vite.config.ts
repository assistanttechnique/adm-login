import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Redirige les appels /api vers le backend Django en développement
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
