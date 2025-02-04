import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc"; // Switched to SWC for faster builds
import viteCompression from "vite-plugin-compression"; // Corrected import
import path from "path";

export default defineConfig({
  base: "/",
  plugins: [
    react({
      jsxImportSource: "@emotion/react", // If using CSS-in-JS
      devTools: process.env.NODE_ENV !== "production",
    }),
    viteCompression({
      algorithm: "brotliCompress", // Enable Brotli compression
      ext: ".br",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Add more aliases if needed
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
        // Add rewrite if needed: rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
    allowedHosts: ["testmyrussian.com", "www.testmyrussian.com"], // Add the host here
    hmr: {
      clientPort: 443,
      protocol: "wss",
      // Consider adding host if behind reverse proxy
    },
    open: true, // Automatically open browser
  },
  build: {
    sourcemap: process.env.NODE_ENV !== "production", // Enable sourcemaps for dev
    minify: "terser", // Explicitly enable minification
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === "production", // Remove console logs in prod
      },
    },
    target: "esnext", // Modern browser targeting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("@radix-ui")) return "vendor-radix";
            if (id.includes("react")) return "vendor-react";
            if (id.includes("recharts")) return "vendor-charts";
            return "vendor-others"; // Catch-all for other dependencies
          }
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },
  optimizeDeps: {
    include: [
      // Add packages that should be pre-bundled
      "react",
      "react-dom",
      "react-router-dom",
      "axios",
    ],
    exclude: ["@radix-ui/react-alert-dialog"], // Exclude if needed
  },
});
