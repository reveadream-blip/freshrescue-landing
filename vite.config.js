import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// ... reste du code
export default defineConfig({
  // Change 'error' par 'info' ou supprime la ligne pour voir le lien local
  logLevel: 'info', 
  plugins: [
    base44({
      // ... ta config
    }),
    react(),
  ]
});