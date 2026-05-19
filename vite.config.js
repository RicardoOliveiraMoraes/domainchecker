import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/rdap': {
        target: 'https://rdap.registro.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rdap/, ''),
      },
    },
  },
})
