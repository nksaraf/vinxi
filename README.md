# `vinxi` (The App Framework)

[![npm version](https://badge.fury.io/js/vinxi.svg)](https://badge.fury.io/js/vinxi)

Compose full stack applications (and frameworks) using [**Vite**](https://github.com/vitejs/vite), the versatile bundler and dev server, and [**Nitro**](https://github.com/unjs/nitro), the universal production server. The core primitive in `vinxi` is a **router**. 

Inspired by the [Bun.App](https://bun.sh/blog/bun-bundler#sneak-peek-bun-app) API. 

- **Routers** are handlers that tell us how specific URLs should be handled. We support various router modes: "static", "spa", "handler", "node-handler" (and new ones can be added). Routers specify the handler file (entrypoint) to use for their `base`-prefixed routes. They can also specify a `dir` and `style` in some router modes to include a file system router that is provided to the handler. Routers specify their bundler configuration, via the `build` property. The routers tell the bundler what entry points to build, what vite plugins to use, etc.

## Goals

Primary goal is to build the tools needed to build a NextJS or SolidStart style metaframework on top of vite without worrying about a lot of the wiring required to keep dev and prod working along with SSR, SPA, RSC, and all the other acronyms. etc. On top of that, we should be able to deploy anywhere easily.

Mostly trying to disappear for the user outside the app.js file

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
	routers: [
		{
			name: "public",
			mode: "static",
			dir: "./public",
			base: "/",
		},
		{
			name: "client",
			mode: "build",
			handler: "./app/client.tsx",
			build: {
				target: "browser",
				plugins: () => [reactRefresh()],
			},
			base: "/_build",
		},
		{
			name: "ssr",
			mode: "handler",
			handler: "./app/server.tsx",
			build: {
				target: "server",
			},
		},
	],
});
```

### Solid SSR

```ts
import { createApp } from "vinxi";
import solid from "vite-plugin-solid";

export default createApp({
	routers: [
		{
			name: "public",
			mode: "static",
			dir: "./public",
			base: "/",
		},
		{
			name: "client",
			mode: "build",
			handler: "./app/client.tsx",
			build: {
				target: "browser",
				plugins: () => [solid({ ssr: true })],
			},
			base: "/_build",
		},
		{
			name: "ssr",
			mode: "handler",
			handler: "./app/server.tsx",
			build: {
				target: "server",
				plugins: () => [solid({ ssr: true })],
			},
		},
	],
});
```
