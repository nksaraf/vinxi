# CLI

## `vinxi dev`

Starts Vinxi's development server for your app. By default, it looks for a `app.config.js` file in the current directory for your app description. You can also pass a path to a different app config file using the `--config` option.

```bash
vinxi dev --config path/to/your-app.js
```

By default, the dev server starts on port 3000. You can change this using the `--port` option.

```bash
vinxi dev --port 3001
```

## `vinxi build`

Builds your app for production. By default, it looks for a `app.config.js` file in the current directory for your app description. You can also pass a path to a different app config file using the `--config` option.

```bash
vinxi build --config path/to/your-app.js
```

By default, we build your app with the `node-server` preset. You can change this using the `--preset` option or the `SERVER_PRESET` environment variable.

```bash
vinxi build --preset vercel-edge

# OR
SERVER_PRESET=vercel-edge vinxi build
```

## `vinxi start` (experimental)

Starts a production server for your app. It looks for your recently built app in the appropriate directory based on the preset. By default, Vinxi uses the `node-server` preset, and looks for your app in the `.output` direction. You can change the preset being used using the `--preset` option or the `SERVER_PRESET` environment variable.

```bash
vinxi start --preset vercel-edge

# OR
SERVER_PRESET=vercel-edge vinxi start
```

## `vinxi serve`

Starts a static file server to preview the build. Options --dir, --host, --port, --base

## `vinxi run` (experimental)

Run any typescript/javascript file within a vinxi runtime. We take care of make things like Typescript, ESM Imports, CJS Imports, etc and give you HMR powered by Vite.

eg.

```bash
vinxi run script.ts
```

This command is quite powerful and can be used to run any script, including server scripts, build scripts, one off tasks, etc. We expose a great scripting API from `vinxi/sh` (uses `dax-sh`).

```ts fileName=script.ts
import $ from "vinxi/sh";

await $`echo "Hello World"`; // prints "Hello World"
```

You can export a default function from your script and we will execute that:

```ts fileName=script.ts
export default async function () {
  console.log("Hello World");
}
```

You can also export an HTTP event handler using `vinxi/http` and we will start a server for you:

```ts fileName=script.ts
import { eventHandler } from "vinxi/http";

export default eventHandler(async (event) => {
  return {
    body: "Hello World",
  };
});
```

And if you want to start the server listener yourself, you can do that too, and `vinxi/listen` is there to help you:

```ts fileName=script.ts
import { eventHandler, toNodeListener } from "vinxi/http";
import { listen } from "vinxi/listen";

const handler = eventHandler(async (event) => {
  return {
    body: "Hello World",
  };
});

await listen(toNodeListener(handler), { port: 3000 });
```

## `vinxi version`

Show the version of vinxi, [vite](https://vitejs.dev/), [nitro](https://nitro.unjs.io/) and [h3](https://h3.unjs.io/).
