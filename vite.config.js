import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // ✅ Use absolute path for Render (not relative)
  base: '/',

  build: {
    outDir: 'dist',
  },

  // ✅ Local dev proxy (ignored by Render)
  server: {
    proxy: {
      '/api': {
        target: 'https://freelancer-backend-65cp.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
