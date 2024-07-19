 <p align="center">
  <h1  align="center" ><img src="/docs/public/logo.png" width="196" /></h1>
  <p align="center">
	 <i>The JavaScript SDK to build full stack apps and frameworks with your own opinions.<br>powered by <code><a href="https://github.com/vitejs/vite">vite</a></code> and <code><a href="https://github.com/unjs/nitro">nitro</a></code></i>
  </p>
  <div align="center"><img src="https://badge.fury.io/js/vinxi.svg" /></div>
</p>

# `vinxi`

Compose full stack applications (and frameworks) using [**Vite**](https://github.com/vitejs/vite), the versatile bundler and dev server, and [**Nitro**](https://github.com/unjs/nitro), the universal production server. The core primitive in `vinxi` is a **router**.

Inspired by the [Bun.App](https://bun.sh/blog/bun-bundler#sneak-peek-bun-app) API.

- **Routers** are handlers that tell us how specific URLs should be handled. We support various router modes: "static", "spa", "http", (and new ones can be added). Routers specify the handler file (entrypoint) to use for their `base`-prefixed routes. They can also specify a `dir` and `style` in some router modes to include a file system router that is provided to the handler. Routers specify their bundler configuration, via the `build` property. The routers tell the bundler what entry points to build, what vite plugins to use, etc.

## Examples

| Framework | Category | Example               | StackBlitz Link                                                                                                                                            |
|-----------|----------|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| React     | RSC      | SPA                     | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/react/rsc/spa)       |
|           | SPA      | Basic                 | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/react/spa/basic) |
|           |          | MDX                   | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/react/spa/mdx)   |
|           |          | TanStack Router (Pages)      | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/react/spa/tanstack-router) |
|           |          | TanStack Router (App)   | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/react/spa/tanstack-router-app) |
|           |          | Wouter                | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/react/spa/wouter) |
|           | SSR      | Basic                 | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/react/ssr/basic) |
|           |          | Basic w/Cloudflare      | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/react/ssr/basic-cloudflare) |
|           |          | TanStack Router (App)   | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/react/ssr/tanstack-router-app) |
|           |          | Wouter                | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/react/ssr/wouter) |
| Solid     | SPA      | Basic                 | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/solid/spa/basic) |
|           | SSR      | Basic                 | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/solid/ssr/basic) |
|           |          | Solid Router          | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/solid/ssr/solid-router) |
| Vanilla   |          | SPA                 | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/vanilla/spa) |
|           |          | TRPC             | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/vanilla/trpc) |




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

## Roadmap

- [ ] `vinxi deploy`
- [x] hooks throughout the app licycle:
	- dev: app:created, app:started, router:created

## Try it out

```bash
npm install vinxi
```

### React SSR

```ts
import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";

export default createApp({
	routers: [
		{
			name: "public",
			type: "static",
			dir: "./public",
		},
		{
			name: "client",
			type: "client",
			handler: "./app/client.tsx",
			target: "browser",
			plugins: () => [reactRefresh()],
			base: "/_build",
		},
		{
			name: "ssr",
			type: "http",
			handler: "./app/server.tsx",
			target: "server",
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
			type: "static",
			dir: "./public",
		},
		{
			name: "client",
			type: "client",
			handler: "./app/client.tsx",
			target: "browser",
			plugins: () => [solid({ ssr: true })],
			base: "/_build",
		},
		{
			name: "ssr",
			type: "http",
			handler: "./app/server.tsx",
			target: "server",
			plugins: () => [solid({ ssr: true })],
		},
	],
});
```
