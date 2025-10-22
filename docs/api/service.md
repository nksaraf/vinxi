# Service API

The core primitive in Vinxi is the **service**, which is simply a brief specification defining how a group of URLs should be handled.

Vinxi supports many common service types:

- ['static'](./service/static) - for serving uncompiled, static assets
- ['http'](./service/http) - for creating traditional web servers
- ['spa'](./service/spa) - for building and serving single page application assets
- ['client'](./service/client) - for building and serving of SSR application assets
- [custom](./service/custom) - for adapting Vinxi to your use case

Creating a new service is as simple as adding a specification object to the `services` array in the `createApp` call:

```ts
import { createApp } from "vinxi";

export default createApp({
  services: [
    // A static service serving files from the `public` directory
    {
      name: "public",
      type: "static",
      dir: "./public",
      base: "/",
    },
    // A http service for an api
    {
      name: "api",
      type: "http",
      handler: "./app/api.ts",
      base: "/api",
      plugins: () => [
        // Vite plugins applying to exclusively to `http` service
      ],
    },
  ],
});
```
