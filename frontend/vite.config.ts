import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/nasa-api': {
        target: 'https://osdr.nasa.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nasa-api/, '/geode-py/ws/api'),
      },
    },
  },
})