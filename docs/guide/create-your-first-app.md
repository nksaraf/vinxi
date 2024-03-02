# Create your first app

Vinxi helps you build the full spectrum of applications with javascript, be it a static site, SPA, just an API or a fully featured SSR'ed and hydrated application.

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
      plugins: () => [reactRefresh()],
      base: "/_build",
    },
    {
      name: "ssr",
      type: "http",
      handler: "./app/server.tsx",
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
      plugins: () => [solid({ ssr: true })],
      base: "/_build",
    },
    {
      name: "ssr",
      type: "http",
      handler: "./app/server.tsx",
      plugins: () => [solid({ ssr: true })],
    },
  ],
});
```
