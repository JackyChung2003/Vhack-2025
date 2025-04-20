import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/Vhack-2025/",
  server: {
    proxy: {
      // Forward all requests starting with /api to avoid hash routing issues
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      buffer: "buffer" // Polyfill for buffer compatibility
    }
  },
  define: {
    global: "window"  // Ensures compatibility with older packages expecting `global`
  }
});
