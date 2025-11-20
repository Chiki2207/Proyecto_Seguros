import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  // Vite sirve automáticamente los archivos de public/ en la raíz
  // Los archivos en public/uploads/ serán accesibles en /uploads/
  publicDir: 'public',
})
