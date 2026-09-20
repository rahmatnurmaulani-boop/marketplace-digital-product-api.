import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000", // Sesuai dengan port backend Anda saat ini
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
