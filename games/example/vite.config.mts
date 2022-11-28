import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import vinxi from "@vinxi/editor"

export default defineConfig({
  // optimizeDeps: {
  //   include: ["@vinxi/editor/fiber"]
  // },
  plugins: [
    vinxi.vite(),
    react({
      babel: {
        plugins: [vinxi.babel]
      }
    })
  ]
})
