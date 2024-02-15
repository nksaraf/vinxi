# What is a Router?

Routers are the core primitive of Vinxi. You can compose your app by combining multiple routers together.

Why routers? If you think about it, the whole web stack is a bunch of http routers. Your browser is a router, your SPA is a router, you server is a router, you public directory is a router.

---

A router is a specification for how a group of routes should be handled. It specifies all kinds of behaviour about the router in the context of conventions, bundling, etc. Lets take a look at the different parts of a router.

---

## Common Options

There are a few options that are common to all types of routers

---

## `name`

- Each router has a name. This can be anything. Your constraint is that the name should also be a valid directory path.

```ts [app.config.js] focus=6,9,12,15
import { createApp } from "vinxi";

export default createApp({
  routers: [
    {
      name: "public",
      // ...
    },
    {
      name: "api",
      // ...
    },
    {
      name: "react-client",
      // ...
    },
    {
      name: "react-ssr",
      // ...
    },
  ],
});
```

---

- The name of the router can be used to reference the router in other routers. For example, to access the manifest of a different router, use `getManifest(routerName)`.

  The manifest contains information about the router like the `inputs`, `routes`, `handler`, `mode`, etc. which can be used to drive the logic of other routers. For example an OpenAPI spec router that generates the spec with routes from other routers.

  This works both in client and server targets. The restriction is that the client can only access it's own manifest, whereas the server can access all manifests.

  To learn more about the manifest, check out the [Manifest API](/api/manifest).

::: code-group

```ts [entry-server.ts] focus=3,4,5
export default eventHandler(() => {
  const serverManifest = getManifest("react-ssr");
  const clientManifest = getManifest("react-client");
});
```

```ts [app.config.js]
import { createApp } from "vinxi";

export default createApp({
  routers: [
    {
      name: "public",
      // ...
    },
    {
      name: "api",
      // ...
    },
    {
      name: "react-client",
      // ...
    },
    {
      name: "react-ssr",
      // ...
    },
  ],
});
```

:::

---

- The name of the router that the code is currently executing can be read from `router.name` exported by `vinxi/manifest`. This can be used to get the current router's manifest which harcoding a name in the code.

::: code-group

```ts [entry-server.ts] focus=3:6
import { routerName } from "vinxi/manifest";

export default eventHandler(() => {
  const serverManifest = getManifest(routerName);
  const clientManifest = getManifest("react-client");
});
```

```ts [entry-client.ts] focus=2,3,4
import { routerName } from "vinxi/manifest";

const clientManifest = getManifest(routerName);
```

```ts [app.config.js]
import { createApp } from "vinxi";

export default createApp({
  routers: [
    {
      name: "public",
    },
    {
      name: "api",
    },
    {
      name: "react-client",
    },
    {
      name: "react-ssr",
    },
  ],
});
```

:::

---

## `type`

- The type of the router.
- Determines how the other parts of the router are interpreted.

::: info

The type is available in your code as:

```ts twoslash
import { isDev, isProd, isSSR, routerType } from "vinxi/manifest";

routerType;
```

:::

```ts [app.config.js] focus=7,11,15,19
import { createApp } from "vinxi";

export default createApp({
  routers: [
    {
      name: "public",
      type: "static",
    },
    {
      name: "api",
      type: "http",
    },
    {
      name: "react-client",
      type: "client",
    },
    {
      name: "react-ssr",
      type: "http",
    },
  ],
});
```

---

> Vinxi supports a few router modes out of the box: `"static"`, `"http"`, `"client"`, `"spa"`. New modes can be added by you too. Lets see how each mode is different?

---

## `type: "static"`

- A simple router that serves files statically from a given folder.
- Its useful for serving static assets like images, fonts, etc.
- Usually every app has one of these.
- No compilation is done for this router.

```ts [app.config.js] focus=6,7
import { createApp } from "vinxi";

export default createApp({
  routers: [
    {
      name: "public",
      type: "static",
      dir: "./public",
    },
  ],
});
```

---

### `dir`

- The directory to serve files from.
- The directory is relative to the current working directory.
-

```ts [app.config.js] focus=8
import { createApp } from "vinxi";

export default createApp({
  routers: [
    {
      name: "public",
      type: "static",
      dir: "./public",
    },
  ],
});
```

---

## type: `"client"`

- A build router serves the compiled handler and subroutes as static assets.
- A common use case is to build the client-side of a SSR app.
- The chunks and entry-points exposed by a build router can be addressed using the manifest by other routers.
- Since its mostly built assets, its good to use a `base` that the user will not visit easily., eg. `"/_build"`
- Supports complete HMR on the client

```ts [app.config.js]
import { createApp } from "vinxi";

export default createApp({
  routers: [
    {
      name: "public",
      type: "static",
      dir: "./public",
    },
    {
      name: "react-client",
      type: "client",
      handler: "./app/entry-client.tsx",
      target: "browser",
      plugins: () => [react()],
      base: "/_client",
    },
  ],
});
```

---

- Use the handler from this router as the `src` to render a script tag in the SSR response.

::: code-group

```ts [app.config.js]
import { createApp } from "vinxi";

export default createApp({
  routers: [
    {
      name: "public",
      type: "static",
      dir: "./public",
    },
    {
      name: "react-client",
      type: "client",
      handler: "./app/entry-client.tsx",
      target: "browser",
      plugins: () => [react()],
      base: "/_client",
    },
  ],
});
```

```ts app/entry-server.ts
const client = getManifest("react-client");
const clientHandler = client.inputs[client.handler];
const scriptSrc = clientHandler.output.path;
const scriptTag = `
  <script src="${scriptSrc}"></script>
`;
```

:::

---

### `handler`

- The mode of the router.
- Determines how the other parts of the router are interpreted.
- The mode is available as `import.meta.env.ROUTER_MODE`.

---

## `type: "http"`

- A router typically targetting the server.
- The router responds to requests matching the `base` path with the event handler exported from the `handler` file.
- It can also include a file system router to map files to sub routes

```ts
import { createApp } from "vinxi";

export default createApp({
  routers: [
    name: "ssr",
    base: "/",
    type: "http",
    handler: "./ssr-handler.ts",
    target: "server"
  ]
})
```

### `handler`

- The mode of the router.
- Determines how the other parts of the router are interpreted.
- The mode is available as `import.meta.env.ROUTER_MODE`.

### `middleware`

- The mode of the router.
- Determines how the other parts of the router are interpreted.
- The mode is available as `import.meta.env.ROUTER_MODE`.

## type: `"spa"`

---

## `base`

- The base path of the router. Default is `/`. It is the path that the router will be mounted at.

  For example, if the base is `"/foo"`, then the router will be mounted at `"/foo"` and will respond to requests matching `"/foo/**/*"`.

- The base path is available in your code as `import.meta.env.BASE_URL`.

- Avoid having multiple routers with the same base path.

```ts [app.config.js] focus=10
import { createApp } from "vinxi";

const app = createApp({
  routers: [
    {
      name: "public",
    },
    {
      name: "react-ssr",
      base: "/",
    },
    {
      name: "react-client",
    },
  ],
});
```

---

- `build` mode routers should be mounted at a unique subpath so that it doesn't interfere with your server routers.

```ts [app.config.js] focus=10,15
import { createApp } from "vinxi";

const app = createApp({
  routers: [
    {
      name: "public"
    },
    {
      name: "api",
      type: "http"
      base: "/api",
    }
    {
      name: "react-ssr",
      type: "http"
      base: "/"
    },
    {
      name: "react-client",
      type: "client",
      base: "/_client"
    }
  ]
})

```

---

## `routes`

- Specifies the subroutes of the router that the compiler should bundle.

- It can be used to implement a file system router that maps files to routes.

---

## `target`

- Target platform for the router.
- Available targets are: `"browser"`, `"server"`

## `plugins`

- List of Vite/Rollup plugins to apply for the router.

### `handler`

- The mode of the router.
- Determines how the other parts of the router are interpreted.
- The mode is available as `import.meta.env.ROUTER_MODE`.
