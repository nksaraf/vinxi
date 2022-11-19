import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

import path, { join, resolve } from "path"
import fs from "fs-extra"
import _debug from "debug"
import tsconfiPaths from "vite-tsconfig-paths"
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite"
import { createMiddleware } from "@hattip/adapter-node"
import { GLTFLoader, DRACOLoader } from "three-stdlib"
import esbuild from "esbuild"

globalThis.fetch = undefined

const d = await import("@react-three/gltfjsx/src/gltfjsx")
// const gltfLoader = new GLTFLoader()
// const dracoloader = new DRACOLoader()
// dracoloader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/")
// gltfLoader.setDRACOLoader(dracoloader)
// let internalFetch = fetch
// globalThis.ProgressEvent = class ProgressEvent {}
// globalThis.fetch = async (req) => {
//   console.log(new URL(req.url).pathname)
//   let text = fs.readFileSync(
//     join(__dirname, "assets", new URL(req.url).pathname),
//     "utf-8"
//   )
//   console.log(text)
//   return new Response(text, {
//     status: 200,
//     headers: {
//       "Content-Type": "application/json"
//     }
//   })
// }

function hattip({
  handler
}: {
  handler: (
    config: ResolvedConfig,
    server: ViteDevServer
  ) => Parameters<typeof createMiddleware>[0]
}): Plugin {
  let config: ResolvedConfig

  function configureServer(server: ViteDevServer) {
    return () => {
      server.middlewares.use(createMiddleware(handler(config, server), {}))
    }
  }

  return {
    name: "vite-plugin-vinxi",
    enforce: "pre",

    configResolved(_config) {
      config = _config
    },
    configureServer
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: "assets",
  plugins: [
    tsconfiPaths(),
    react(),
    {
      name: "cross-server",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          // cross origin isolation
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin")
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp")
          next()
        })
      }
    },
    {
      name: "gltfjsx",
      resolveId(id) {
        if (id.endsWith("?gltfjsx")) {
          console.log("resolving", id)
          return id
        }
      },
      async load(id) {
        if (id.endsWith("?gltfjsx")) {
          console.log("loading", id)
          let fp = id
            .replace("@assets", "assets")
            .replace("?gltfjsx", "")
            .replace(".jsx", "")
          const js = await d.default(fp, "Ghost.jsx", {})

          const { name } = path.parse(fp)
          let code = fs.readFileSync("Ghost.jsx", "utf-8")

          console.log({ name, fp })

          code = code
            .replace(`'/${name}.gltf'`, `'${fp.replace(process.cwd(), "")}'`)
            .replace(`'/${name}.gltf'`, `'${fp.replace(process.cwd(), "")}'`)
            .replace(
              "const { actions } = useAnimations(animations, group)",
              `
            const actions = useAnimations(animations, group);
            React.useLayoutEffect(() => {
              props.entity.mixer$ = actions
            }, [props.entity, actions])
            `
            )
            .replace(
              `return (`,
              `
            console.log(props)
            React.useLayoutEffect(() => {
              if (props.entity) {
                props.game.world.addComponent(props.entity, "gltfMesh$", group.current);
                props.entity.gltfMesh$ = group.current
                
              }
            }, [props.entity, nodes])
            return (
            `
            )
          console.log(code)

          return esbuild.transformSync(code, {
            jsx: "automatic",
            loader: "jsx"
          }).code
        }
      }
    },
    hattip({
      handler: (config, server) => async (event) => {
        let url = new URL(event.request.url)
        console.log("url", url.pathname)
        if (url.pathname === "/index.html") {
          let file = fs.readFileSync(resolve(config.root, "index.html"))
          return new Response(
            await server.transformIndexHtml(url.pathname, file.toString()),
            {
              headers: {
                "content-type": "text/html",
                // cors headers
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",

                // cross origin isolation
                "Cross-Origin-Embedder-Policy": "require-corp",
                "Cross-Origin-Opener-Policy": "same-origin"
              }
            }
          )
        }
        if (
          event.request.method === "POST" &&
          url.pathname === "/__editor/save"
        ) {
          const { name, scene } = await event.request.json()
          console.log("saving", name, scene)
          fs.writeFileSync("assets/" + name, scene)
          return new Response("ok")
        }
        if (
          event.request.method === "GET" &&
          url.pathname.startsWith("/__editor/scene")
        ) {
          const scene = fs.readFileSync(
            resolve(
              config.root,
              "scenes" + url.pathname.replace("/scene", "assets")
            ),
            "utf-8"
          )
          return new Response(scene, {
            headers: {
              "Content-Type": "application/json"
            }
          })
        }
        return new Response(``)
        // find out which scene is the editor for
      }
    })
  ]
})
