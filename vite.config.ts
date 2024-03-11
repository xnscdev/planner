import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules/.pnpm")) {
            return id.split("node_modules/.pnpm/")[1].split("/")[0];
          }
        },
      },
    },
  },
});
