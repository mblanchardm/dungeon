import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// #region agent log
function debugLogPlugin() {
  return {
    name: 'debug-log',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        fetch('http://127.0.0.1:7245/ingest/5c757587-eaee-44d5-88e5-7f792addf5e3', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'vite.config.js:configureServer', message: 'Vite server ready', data: {}, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'H2' }) }).catch(() => {});
      });
    },
  };
}
// #endregion

export default defineConfig({
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
  plugins: [
    debugLogPlugin(),
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
