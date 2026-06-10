import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["han.png", "favicon-32.png", "apple-touch-icon.png"],
      manifest: {
        name: "Han - แชร์บิลง่าย ๆ",
        short_name: "Han",
        description: "Han - แชร์บิลง่าย ๆ ด้วย QR code พร้อมเพย์",
        lang: "th",
        theme_color: "#171717",
        background_color: "#171717",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
