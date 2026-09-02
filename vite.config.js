import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Escucha en todas las interfaces (no solo localhost) para poder
    // probar el responsive desde el celular en la misma red local.
    host: true,
  },
})
