import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // ✅ Keeps asset paths relative
  base: './',

  // ✅ Explicit output directory
  build: {
    outDir: 'dist',
  },

  // ✅ Proxy (used only in local dev, ignored by Render)
  server: {
    proxy: {
      '/api': {
        target: 'https://freelancer-backend-65cp.onrender.com',
        changeOrigin: true,
        secure: true, // ✅ must be true for HTTPS
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
