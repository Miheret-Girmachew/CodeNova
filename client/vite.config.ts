import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path" // <-- ADD THIS IMPORT

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // 👇 ADD THIS ENTIRE 'resolve' SECTION 👇
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})