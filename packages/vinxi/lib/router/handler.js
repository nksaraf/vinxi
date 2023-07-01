import fs from "fs";
import { isAbsolute, join, relative } from "pathe";
import { FileSystemRouter } from "../file-system-router.js";
import invariant from "../invariant.js";
import { handleNodeRequest } from "../node/node-web-server.js";
import { AppWorkerClient } from "../worker/app-worker-client.js";
import { createRouterMode, shouldCreateWorker } from "../router-mode.js";
import { createProdManifest } from "../manifest/prod-server-manifest.js";
import { createDevManifest } from "../manifest/dev-server-manifest.js";
import { createBuild } from "../vite-utils.js";

export const handler = createRouterMode({
  name: "handler",
  async prodMiddleware(router, serveConfig, connect) {
    const bundler = this.getBundler(router);
    const bunlderManifest = JSON.parse(
      fs.readFileSync(
        join(bundler.outDir, router.prefix, "manifest.json"),
        "utf-8"
      )
    );

    let handlerAsset = bunlderManifest[relative(router.root, router.handler)];

    const manifest = this.createProdManifest(this.config);

    let middleware = async (req, res) => {
      const handler = await import(
        join(bundler.outDir, router.prefix, handlerAsset.file)
      );
      let context = {
        manifest,
        prefix: router.prefix,
        router,
        fetch() {},
        import: (id) => import(id),
      };

      if (router.fileRouter) {
        context.match = router.fileRouter.match(req.url);
      }

      try {
        await handleNodeRequest(req, res, handler.default, context);
      } catch (e) {
        res.statusCode = 500;
        res.end(this.renderError(e));
      }
    };

    if (router.prefix) {
      connect.use(router.prefix, middleware);
    } else {
      connect.use(middleware);
    }
  },
  async devMiddleware(router, serveConfig, app) {
    const bundler = this.getBundler(router);
    if (shouldCreateWorker(bundler)) {
      router.worker = await new AppWorkerClient(
        new URL("./../worker/app-worker.js", import.meta.url)
      );
      await router.worker.init();
    }

    router.devServer = await this.createDevServer({}, router, serveConfig);

    const manifest = createDevManifest(this, router.devServer);
    let middleware = this.createNodeMiddleware(async (req, res, next) => {
      let handler = await router.devServer.ssrLoadModule(router.handler);
      invariant(
        "default" in handler,
        "Handler should default export a function"
      );

      let context = {
        manifest,
        prefix: router.prefix,
        router,
        async fetch(request) {
          let route = appConfig.routers.find((r) => r.name === "react-rsc");
          invariant(route.mode === "handler", "");
          if (route.worker) {
            const stream = await route.worker.fetch(request);
            return new Response(stream);
          }
        },
        import: (id) => router.devServer.ssrLoadModule(id),
      };

      if (router.fileRouter) {
        context.match = router.fileRouter.match(req.url);
      }

      try {
        await handleNodeRequest(req, res, handler.default, context);
      } catch (e) {
        res.statusCode = 500;
        res.end(this.renderError(e));
      }
    }, router);

    if (router.prefix) {
      app.use(router.prefix, middleware);
    } else {
      app.use(middleware);
    }
  },
  async build(router) {
    const bundler = this.getBundler(router);
    const entries = this.getEntries(router);

    await createBuild({
      build: {
        rollupOptions: {
          input: entries,
        },
        ssr: true,
        manifest: true,
        ssrEmitAssets: true,
        outDir: join(bundler.outDir, router.prefix),
        emptyOutDir: false,
      },
      base: router.prefix,
      router,
      bundler,
      plugins: bundler.plugins,
      publicDir: false,
    });
  },
  resolveConfig(router, appConfig) {
    let handler = router.handler
      ? isAbsolute(router.handler)
        ? router.handler
        : join(appConfig.root, router.handler)
      : undefined;

    invariant(handler, "No handler found for node-handler router");

    let dir = router.dir
      ? isAbsolute(router.dir)
        ? router.dir
        : join(appConfig.root, router.dir)
      : undefined;

    let routerStyle = router.style ?? "static";

    invariant(
      routerStyle !== "static" ? dir : true,
      `There should be dir provided if the router style is ${routerStyle}`
    );

    let fileRouter =
      routerStyle !== "static" && router.dir
        ? new FileSystemRouter({ dir, style: router.style })
        : undefined;

    invariant(
      fileRouter ? router.handler : true,
      "No handler found for SPA router. When `dir` is being used with `style` for file system routing, `handler` must be specified."
    );

    return {
      prefix: undefined,
      ...router,
      root: appConfig.root,
      dir,
      style: routerStyle,
      fileRouter,
      handler,
    };
  },
});
