# CLI

## `vinxi dev`

## `vinxi build`

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
