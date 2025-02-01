import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "https://testmyrussian.com",
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      clientPort: 443,
      protocol: "wss",
    },
    https: false,
    allowedHosts: ["testmyrussian.com", "www.testmyrussian.com"],
  },
  // Add static file serving configuration
  publicDir: "public",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    // Copy models directory to build output
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith(".bin")) {
            return "models/[name][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
});
