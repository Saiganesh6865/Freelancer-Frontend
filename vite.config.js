import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync } from 'fs'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-redirects',
      closeBundle() {
        // ✅ Copy _redirects file to dist after build
        if (existsSync('public/_redirects')) {
          copyFileSync('public/_redirects', 'dist/_redirects')
          console.log('✅ _redirects copied successfully!')
        } else {
          console.warn('⚠️ No _redirects file found in /public')
        }
      },
    },
  ],

  base: '/',

  build: {
    outDir: 'dist',
  },

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
