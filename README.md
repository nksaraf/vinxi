 <p align="center">
  <h1  align="center" ><img src="/docs/public/logo.png" width="196" /></h1>
  <p align="center">
	 <i>The JavaScript toolkit to build full stack apps and frameworks with your own opinions.<br>powered by <code><a href="https://github.com/vitejs/vite">vite</a></code> and <code><a href="https://github.com/unjs/nitro">nitro</a></code></i>
  </p>
  <div align="center"><img src="https://badge.fury.io/js/vinxi.svg" /></div>
</p>

# `vinxi`

Compose full stack applications (and frameworks) using [**Vite**](https://github.com/vitejs/vite), the versatile bundler and dev server, and [**Nitro**](https://github.com/unjs/nitro), the universal production server.

Inspired by the [Bun.App](https://bun.sh/blog/bun-bundler#sneak-peek-bun-app) API, the core primitive in Vinxi is the **router**, which is simply a brief specification defining how a group of URLs should be handled.

Vinxi supports many common router types:

- ['static'](https://vinxi.vercel.app/api/router/static.html) - for serving uncompiled, static assets
- ['http'](https://vinxi.vercel.app/api/router/http.html) - for creating traditional web servers
- ['spa'](https://vinxi.vercel.app/api/router/spa.html) - for building and serving single page application assets
- ['client'](https://vinxi.vercel.app/api/router/client.html) - for building and serving of SSR application assets
- [custom](https://vinxi.vercel.app/api/router/custom.html) - for adapting Vinxi to your use case

Creating a new router is as simple as adding a specification object to the `routers` array in the `createApp` call:

```ts
import { createApp } from "vinxi";

export default createApp({
  routers: [
    // A static router serving files from the `public` directory
    {
      name: "public",
      type: "static",
      dir: "./public",
      base: "/",
    },
    // A http router for an api
    {
      name: "api",
      type: "http",
      handler: "./app/api.ts",
      base: "/api",
      plugins: () => [
        // Vite plugins applying exclusively to `http` router
      ],
    },
  ],
});
```

---

Frameworks actively being developed on `vinxi`:

- [SolidStart](https://github.com/solidjs/solid-start)

There are also a few other frameworks experimenting with vinxi:

- [AngularStart](https://github.com/brandonroberts/analog-angular-start)

## Examples

| Framework | Category | Example                 | StackBlitz Link                                                                                                                                                                    |
| --------- | -------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React     | RSC      | SPA                     | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/react/rsc/spa)                 |
|           | SPA      | Basic                   | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/react/spa/basic)               |
|           |          | MDX                     | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/react/spa/mdx)                 |
|           |          | TanStack Router (Pages) | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/react/spa/tanstack-router)     |
|           |          | TanStack Router (App)   | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/react/spa/tanstack-router-app) |
|           |          | Wouter                  | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/react/spa/wouter)              |
|           | SSR      | Basic                   | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/react/ssr/basic)               |
|           |          | Basic w/Cloudflare      | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/react/ssr/basic-cloudflare)    |
|           |          | TanStack Router (App)   | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/react/ssr/tanstack-router-app) |
|           |          | Wouter                  | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/react/ssr/wouter)              |
| Solid     | SPA      | Basic                   | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/solid/spa/basic)               |
|           | SSR      | Basic                   | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/solid/ssr/basic)               |
|           |          | Solid Router            | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/solid/ssr/solid-router)        |
| Vanilla   |          | SPA                     | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/vanilla/spa)                   |
|           |          | TRPC                    | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nksaraf/vinxi/tree/main/examples/vanilla/trpc)                  |

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
