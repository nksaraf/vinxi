# App API

Vinxi is designed primary as a runtime for your server applications. The routers included in the app drive the behavior of the server, but the server is in your control via the `App` API.

## `App` API

### `createApp(config)`

The primary way to use Vinxi is to use `createApp` to create an app,

::: code-group

```ts [app.js]
import { createApp } from "vinxi";

export default createApp({
  routers: [
    {
      name: "public",
      type: "static",
      dir: "./public",
    },
    {
      name: "api",
      type: "http",
      handler: "./server.ts",
      target: "server",
    },
    // ... other routers
  ],
});
```

:::

::: info

To learn more about how to describe your app to Vinxi and use `createApp`, see the [App API](/api/app).

:::

The `createApp` function return an instance of `App`. This instance has the following methods that you can use to create your own experience:

### `app.dev()`

Starts the development server for the app.

```ts
import { createApp } from "vinxi";

const app = createApp({
  routers: [
    // ... routers
  ],
});

await app.dev();
```

### `app.build()`

Builds the app for production.

```ts
import { createApp } from "vinxi";

const app = createApp({
  routers: [
    // ... routers
  ],
});

await app.build();
```

### `app.getRouter(name)`

Gets a router by name.

```ts
import { createApp } from "vinxi";

const app = createApp({
  routers: [
    // ... routers
  ],
});

const router = app.getRouter("api");
```

## Running a Vinxi app using `node`

You can run a file that creates a Vinxi app using the regular `node` CLI.

```bash
node app.js
```

If you run the app without any additional options, it will just create the `App` and not start the server.

You can use the `--dev` option to start the development server for your application.

```bash
node app.js --dev
```

And, you can use the `--build` option to build your application for production.

```bash
node app.js --build
```

::: info

The `--dev` and `--build` flags use the underlying [`app.dev()`](#app-dev) and [`app.build()`](#app-build) methods to start the development server and build the app. They are just shortcuts to make it easier to run the app using `node`.

:::

The built application can be started by running the built node server file using `node` or whatever preset you decided the build the app with.

```bash
node .output/server/index.mjs
```

## Wrapping Vinxi

You can also wrap Vinxi in your own runtime to add a pre-configured set of routers, middlewares, and other settings. You can also use it to add your own custom logic to the server.

::: code-group

```ts [node_modules/framework]
import { createApp } from "vinxi";

export function createFrameworkApp() {
  return createApp({
    routers: [
      {
        name: "public",
        type: "static",
        dir: "./public",
      },
      {
        name: "api",
        type: "http",
        handler: "./server.ts",
        target: "server",
      },
      // ... other routers
    ],
  });
}
```

:::

::: code-group

```ts [app.js]
import { createFrameworkApp } from "framework";

export default createFrameworkApp();
```

:::

The created app can be used by your own CLI or other runtime to start the development server and build the app

```ts [bin/cli.mjs]
import { createFrameworkApp } from "framework";

const app = createFrameworkApp();
if (process.argv.includes("--dev")) {
  await app.dev();
} else if (process.argv.includes("--build")) {
  await app.build();
}
```
