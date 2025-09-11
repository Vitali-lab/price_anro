import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          firebase: ['firebase/app', 'firebase/firestore'],
          ui: ['framer-motion'],
          utils: ['docxtemplater', 'file-saver', 'pizzip', 'xlsx']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      port: 3000,
    },
    historyApiFallback: true,
  },
  preview: {
    port: 4173,
    open: true,
  },
});
//price_anro/
