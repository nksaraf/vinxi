# Router API

Inspired by the [Bun.App](https://bun.sh/blog/bun-bundler#sneak-peek-bun-app) API, the core primitive in Vinxi is the **router**, which is simply a brief specification defining how a group of URLs should be handled.

Vinxi supports many common router types:
- ['static'](./router/static) - for serving uncompiled, static assets
- ['http'](./router/http) - for creating traditional web servers
- ['spa'](./router/spa) - for building and serving single page application assets
- ['client'](./router/client) - for building and serving of SSR application assets
- [custom](./router/custom) - for adapting Vinxi to your use case

Creating a new router is as simple as adding a specification object to the `routers` array in the `createApp` call:

```ts
import { createApp } from 'vinxi';

export default createApp({
  routers: [
    // A static router serving files from the `public` directory
    {
      name: 'public',
      type: 'static',
      dir: './public',
      base: '/',
    },
    // A http router for an api
    {
      name: 'api',
      type: 'http',
      handler: './app/api.ts',
      base: '/api',
      plugins: () => [
        // Vite plugins applying to exclusively to `http` router
      ]
    }
  ],
});
```