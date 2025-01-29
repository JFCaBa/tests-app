import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === "development";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true,
      port: 5173,
      proxy: isDevelopment
        ? {
            "/api": {
              target: "http://localhost:1999",
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
    build: {
      sourcemap: true,
    },
  };
});
