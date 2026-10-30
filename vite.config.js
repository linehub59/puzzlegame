
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "PuzzlePop Kids - Puzzle Games",
        short_name: "PuzzlePop",
        description: "Fun little puzzles for curious minds.",
        theme_color: "#7456d6",
        background_color: "#fff9f0",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any"
          }
        ]
      },
      workbox: {
        globPatterns: [
          "**/*.{js,css,html,svg,png,webp,woff2}"
        ]
      }
    })
  ]
});
