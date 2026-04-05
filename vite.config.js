import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path' // Indispensable pour gérer les chemins

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'info', 
  plugins: [
    base44({
      // ta config existante
    }),
    react(),
  ],
  resolve: {
    alias: {
      // On dit à Vite : quand tu vois "@", cherche dans le dossier "src"
      "@": path.resolve(__dirname, "./src"),
    },
  },
});