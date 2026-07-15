import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/ai-fpa-concept/",
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      input: {
        main: "index.html",
        managementConcept: "management-concept.html",
      },
    },
  },
});
