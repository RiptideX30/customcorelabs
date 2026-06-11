import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  base: "/",
  plugins: [tailwindcss(), TanStackRouterVite(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    middlewareMode: false,
    proxy: {
      "/api": {
        target: "https://build-tracker.cdwojick.workers.dev",
        changeOrigin: true,
      },
      "/admin": {
        target: "https://build-tracker.cdwojick.workers.dev",
        changeOrigin: true,
      },
    },
  },
});
