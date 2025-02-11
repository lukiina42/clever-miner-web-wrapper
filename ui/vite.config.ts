import path from "path"
import { defineConfig } from "vite"
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
      TanStackRouterVite({ autoCodeSplitting: true }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
