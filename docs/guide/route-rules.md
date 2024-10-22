# Route Rules

Vinxi exposes the [route rules](https://nitro.unjs.io/guide/routing#route-rules) feature of Nitro. This allows you to configure the server to handle certain routes in a specific way. For example, you can configure a route to proxy requests to another server, or redirect a route to another route. This is incredibly powerful to overlay server behaviour on top of your normal applications.

```ts [app.config.js]
import { createApp } from "vinxi";

export default createApp({
  server: {
    routeRules: {
      "/_build/assets/**": { headers: { "cache-control": "s-maxage=0" } },
      '/blog/**': { swr: true },
      '/blog/**': { swr: 600 },
      '/blog/**': { static: true },
      '/blog/**': { cache: { /* cache options*/ } },
      '/assets/**': { headers: { 'cache-control': 's-maxage=0' } },
      '/api/v1/**': { cors: true, headers: { 'access-control-allow-methods': 'GET' } },
      '/old-page': { redirect: '/new-page' }, // uses status code 307 (Temporary Redirect)
      '/old-page2': { redirect: { to:'/new-page2', statusCode: 301 } },
      '/old-page/**': { redirect: '/new-page/**' },
      '/proxy/example': { proxy: 'https://example.com' },
      '/proxy/**': { proxy: '/api/**' },
    },
  },
  routers: [
    // ...
  ],
});
```
