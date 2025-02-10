import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import viteCompression from "vite-plugin-compression";
import path from "path";

export default defineConfig({
  base: "/",
  plugins: [
    react({
      jsxImportSource: undefined, // Remove emotion
    }),
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
    }),
  ],
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
    allowedHosts: ["testmyrussian.com", "www.testmyrussian.com"],
    hmr: {
      clientPort: 443,
      protocol: "wss",
    },
    open: true,
  },
  build: {
    sourcemap: process.env.NODE_ENV !== "production",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === "production",
      },
    },
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("@radix-ui")) return "vendor-radix";
            if (id.includes("react")) return "vendor-react";
            if (id.includes("recharts")) return "vendor-charts";
            return "vendor-others";
          }
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "axios",
      "@radix-ui/react-toast",
    ],
  },
});
