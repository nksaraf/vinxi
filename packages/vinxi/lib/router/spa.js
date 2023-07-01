import fs from "fs";
import { dirname, isAbsolute, join, relative } from "pathe";
import serveStatic from "serve-static";
import { FileSystemRouter } from "../file-system-router.js";
import invariant from "../invariant.js";
import { createRouterMode } from "../router-mode.js";
import { createBuild } from "../vite-utils.js";

export const spa = createRouterMode({
  name: "spa",
  async prodMiddleware(router, appConfig, app) {
    const bundler = this.getBundler(router);
    app.use(router.prefix, serveStatic(join(bundler.outDir, router.prefix)));
    app.use(router.prefix, (req, res) => {
      res.setHeader("Content-Type", "text/html");
      res.write(
        fs.readFileSync(join(bundler.outDir, router.prefix, "index.html"))
      );
      res.end();
    });
  },
  async devMiddleware(router, serveConfig, app) {
    let viteServer = await this.createDevServer(
      {
        appType: "spa",
        publicDir: relative(router.root, router.public),
        root: router.root,
      },
      router,
      serveConfig
    );

    // vite's spa appType takes care of serving the index.html file for all routes at this prefix
    app.use(router.prefix, viteServer.middlewares);
  },
  async build(router) {
    const bundler = this.getBundler(router);
    const entries = this.getEntries(router);

    await createBuild({
      build: {
        rollupOptions: {
          input: entries,
          preserveEntrySignatures: "exports-only",
        },
        manifest: true,
        outDir: relative(router.root, join(bundler.outDir, router.prefix)),
        emptyOutDir: false,
      },
      root: relative(this.config.root, router.root),
      router,
      bundler,
      publicDir: relative(router.root, router.public),
      base: router.prefix,
      plugins: bundler.plugins,
    });
  },
  resolveConfig(router, appConfig) {
    let dir = router.dir
      ? isAbsolute(router.dir)
        ? router.dir
        : join(appConfig.root, router.dir)
      : undefined;

    let routerStyle = router.style ?? "static";

    let fileRouter =
      routerStyle !== "static" && router.dir
        ? new FileSystemRouter({ dir, style: router.style })
        : undefined;

    invariant(
      fileRouter ? router.handler : true,
      "No handler found for SPA router. When `dir` is being used with `style` for file system routing, `handler` must be specified."
    );

    let handler = router.handler
      ? isAbsolute(router.handler)
        ? router.handler
        : join(appConfig.root, router.handler)
      : dir
      ? join(dir, "index.html")
      : undefined;

    invariant(handler, "No handler found for SPA router");

    let root = dirname(handler);

    let publicDir = router.public
      ? isAbsolute(router.public)
        ? router.public
        : join(appConfig.root, router.public)
      : undefined;

    return {
      prefix: undefined,
      ...router,
      root,
      dir,
      handler,
      public: publicDir,
      style: routerStyle,
      fileRouter,
    };
  },
});
