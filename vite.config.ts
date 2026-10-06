import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Listens on all local IP addresses (0.0.0.0)
    allowedHosts: true, // Allows localtunnel / ngrok host headers
  },
});
