import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  // For GitHub Pages: use repo name path. For Netlify: use root /
  base: process.env.VITE_BASE_PATH || (isDev ? '/' : '/Custom-Core-Labs-v1.0/'),
  plugins: [
    tailwindcss(), 
    TanStackRouterVite({
      target: 'react'
    }), 
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'esbuild',
    reportCompressedSize: true,
  },
  server: {
    middlewareMode: false,
  },
});
