import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'info', 
  server: {
    port: 5174,
    strictPort: true,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      // On dit à Vite : quand tu vois "@", cherche dans le dossier "src"
      "@": path.resolve(__dirname, "./src"),
    },
  },
});