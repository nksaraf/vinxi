import { join, relative } from "pathe";
import findAssetsInViteManifest from "./vite-manifest.js";
import { createViteManifest } from "./create-vite-manifest.js";

export function createSPAManifest(config, bundle, format) {
  const manifest = createViteManifest(config, bundle, format);
  let routeManifest = {};
  if (config.router && config.router.fileRouter) {
    for (const route of config.router.fileRouter.routes) {
      routeManifest[route.filePath] = {
        output: join(
          config.base,
          manifest[relative(config.router.root, route.filePath)].file
        ),
        assets: findAssetsInViteManifest(
          manifest,
          relative(config.router.root, route.filePath)
        )
          .filter((asset) => asset.endsWith(".css"))
          .map((asset) => ({
            tag: "link",
            attrs: {
              href: join(config.base, asset),
              key: join(config.base, asset),
              rel: "stylesheet",
              precendence: "high",
            },
          })),
      };
    }
  }
}
