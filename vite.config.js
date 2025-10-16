import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // ✅ This makes sure your app loads assets correctly when deployed
  base: './',

  // ✅ Local dev proxy (Render ignores this section in production)
  server: {
    proxy: {
      '/api': {
        // target: 'http://127.0.0.1:5000',  
        target:'https://freelancer-backend-65cp.onrender.com',    // render server
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')  // /api/login => /login
      }
    }
  }
})


