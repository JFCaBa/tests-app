import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // Allows access via LAN & IPv6
    port: 5173,
    strictPort: true, // Ensures Vite doesn't switch ports if 5173 is occupied
    proxy: {
      "/api": {
        target: "http://localhost:1999",
        changeOrigin: true,
      },
    },
    allowedHosts: ["testmyrussian.com", "www.testmyrussian.com"], // Allow domain
  },
});
