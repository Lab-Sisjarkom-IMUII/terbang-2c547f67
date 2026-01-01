import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      devOptions: { enabled: mode === "development" },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"]
      },
      manifest: {
        name: "Terbang",
        short_name: "Terbang",
        start_url: "/login",
        display: "standalone",
        background_color: "#0B0F1A",
        theme_color: "#6366F1",
        description: "Sistem Pengelolaan Stok Berbasis AI Vision",
        icons: [
          { src: "/favicon.ico", sizes: "64x64 32x32 24x24 16x16", type: "image/x-icon" },
          { src: "/placeholder.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
          { src: "/placeholder.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" }
        ],
      },
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
