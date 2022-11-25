import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import editor from "@vinxi/editor"

export default defineConfig({
  // optimizeDeps: {
  //   include: ["@vinxi/editor/fiber"]
  // },
  plugins: [
    react({
      babel: {
        plugins: [editor]
      }
    })
  ]
})
