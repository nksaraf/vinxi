# `vinxi` (The App Framework)
Compose full stack applications (and frameworks) using [**Vite**](https://github.com/vitejs/vite), the versatile bundler and dev server, and [**Nitro**](https://github.com/unjs/nitro), the universal production server. The primitive in `vinxi` is a **router**. 

Inspired by the [Bun.App](https://bun.sh/blog/bun-bundler#sneak-peek-bun-app) API. 

- **Routers** are handlers that tell us how specific URLs should be handled. We support various router modes: "static", "spa", "handler", "node-handler" (and new ones can be added). Routers specify the handler file (entrypoint) to use for their `prefix`ed routes. They can also specify a `dir` and `style` in some router modes to include a file system router that is provided to the handler. Routers have to specify a bundler to use, via the `build` property. The routers tell the bundler what entry points to build. Multiple routers can use the same bundler (but they should be served at different prefixes).
- **Bundlers** are vite config "templates" that can be used by routers to specify how they should be built. Eg. "static-server", "solid-spa", "react-ssr". They are named and referenced by the routers. These are likely to be authored by frameworks for their specific needs. They are essentially vite configs without specifying the entry points.
- 
## Goals

Primary goal is build the tools needed to build a NextJS or SolidStart style metaframework on top of vite without worrying about a lot of the wiring required to keep dev and prod working along with SSR, SPA, RSC, and all the other acronyms. etc. 

Mostly trying to disappear for the user outside the app.config.js file

The surface layer we are intending to tackle:
1. Full stack builds (handle manifest stuff to figure out what assets to load at prod runtime)
2. Dev time asset handling (avoiding FOUC in SSR frameworks) and smoothing over some of vite's dev/prod mismatching behaviours by providing common manifest APIs that work in dev and prod the same way
3. File system router (not any specific file system conventions, just an API for interfacing with FileSystemRouters and utils to implement your conventions in them)
4. Building the server, and providing a simple opaque `handler` API to control the server
5. Adapter stuff to deploy to various platforms with support for all the features they provide
6. Not to abstract away the platforms. Let people use what they want to the fullest
7. Have little opinion about how the app should be authored or structured

## How to run

```bash
npm install
node app.js --dev
```

### React SSR

```ts
import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";

export default createApp({
	bundlers: [
		{
			name: "static-server",
			outDir: "./.build/client",
		},
		{
			name: "node-api",
			target: "node",
			outDir: "./.build/api",
		},
		{
			name: "client",
			target: "browser",
			outDir: "./.build/api",
			plugins: () => [reactRefresh()],
		},
	],
	routers: [
		{
			mode: "static",
			name: "static",
			build: "static-server",
			dir: "./public",
			base: "/",
		},
		{
			mode: "build",
			name: "client",
			handler: "./app/client.tsx",
			build: "client",
			base: "/_build",
		},
		{
			mode: "node-handler",
			handler: "./app/server.tsx",
			name: "api",
			build: "node-api",
		},
	],
});
```

### Solid SSR

```ts
import { createApp } from "vinxi";
import solid from "vite-plugin-solid";

export default createApp({
	bundlers: [
		{
			name: "static-server",
			outDir: "./.build/client",
		},
		{
			name: "node-api",
			target: "node",
			outDir: "./.build/api",
			plugins: () => [solid({ ssr: true })],
		},
		{
			name: "client",
			target: "browser",
			outDir: "./.build/api",
			plugins: () => [solid({ ssr: true })],
		},
	],
	routers: [
		{
			mode: "static",
			name: "static",
			build: "static-server",
			dir: "./public",
			base: "/",
		},
		{
			mode: "build",
			name: "client",
			handler: "./app/client.tsx",
			build: "client",
			base: "/_build",
		},
		{
			mode: "node-handler",
			handler: "./app/server.tsx",
			name: "api",
			build: "node-api",
		},
	],
});

```
