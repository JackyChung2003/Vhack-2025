import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/Vhack-2025/",  
  resolve: {
    alias: {
      buffer: "buffer" // Polyfill for buffer compatibility
    }
  },
  define: {
    global: "window"  // Ensures compatibility with older packages expecting `global`
  }
});
