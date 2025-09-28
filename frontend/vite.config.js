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
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === "production",
      },
    },
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-others': [
            'axios',
            'react-router-dom',
            'react-i18next',
            'i18next',
            'lucide-react',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
          ],
        },
      },
    },
    outDir: "dist", // Changed from build to dist to match Dockerfile
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
  root: "./", // This is crucial: sets the project root
  publicDir: "./public", // This is crucial: sets the public directory
});
