import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://p2vzpcsr-8000.inc1.devtunnels.ms/',
        changeOrigin: true,
      },
      '/ws': {
        target: 'wss://p2vzpcsr-8000.inc1.devtunnels.ms/',
        ws: true,
        changeOrigin: true,
        secure: true,
      },
    },
  },
})