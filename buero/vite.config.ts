import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Wird unter https://<nutzer>.github.io/Fokus/buero/ ausgeliefert.
export default defineConfig({
  plugins: [react()],
  base: '/Fokus/buero/',
})
