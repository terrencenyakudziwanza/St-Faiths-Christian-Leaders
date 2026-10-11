import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const siteUrl = env.VITE_SITE_URL ||
    "https://www.stfaithschristianleaders.com";

  return {
    plugins: [react(), tailwindcss()],
    define: { "import.meta.env.VITE_SITE_URL": JSON.stringify(siteUrl) },
    server: {
      host: true, // Listens on all local IP addresses (0.0.0.0)
      allowedHosts: true, // Allows localtunnel / ngrok host headers
    },
  };
});
