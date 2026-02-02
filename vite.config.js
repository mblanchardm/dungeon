import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Personajes D&D',
        short_name: 'D&D Personajes',
        description: 'Creador y seguimiento de personajes D&D 5e',
        start_url: '/',
        display: 'standalone',
        background_color: '#1e293b',
        theme_color: '#6b21a8',
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
