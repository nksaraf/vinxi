# Add to existing Vite app

While vite is amazing as a devkit for client-side web applications, it requires some setup to use the server in the same application. The funny part is that there is a server running both in dev and prod, its just that you don't get access to it.

Vinxi gives you the ability to add server-side functionality (SSR) to an existing Vite app.

A typical `vite` app is a single-page application, with an `index.html` file, a `public` directory and a `vite.config.ts` file.

Lets install `vinxi` to get started:

```bash [npm]
npm install vinxi
```

The first step is to make your `vite` app into a `vinxi` app. You don't need to create any new files. Vinxi works with `vite.config.ts` files too. You just need to change what you export from the file.

Here is an example of a `vite.config.ts` file that exports the same `vite` app as a `vinxi` app:

```ts
import { createApp } from "vinxi";
import { config } from "vinxi/plugins/config";

export default createApp({
  routers: [
    {
      name: "public",
      type: "static",
      dir: "./public",
    },
    {
      name: "client",
      type: "spa",
      handler: "./index.html",
      base: "/",
      plugins: () => [
        config("custom", {
          // additional vite options
        }),
        // additional vite plugins
      ],
    },
  ],
});
```

Now running `npm run dev` will start the Vinxi dev server and you will get the same experience as you did with `vite`.

The only difference is that you can now add server-side functionality to your app, and much more. Let's see how.

Let's imagine we need to send an email when a user submits a form. We can use the `nodemailer` package to do that. Let's install it.

```bash[npm]
npm install nodemailer
```

```bash[yarn]
yarn add nodemailer
```

```bash[pnpm]
pnpm add nodemailer
```

But `nodemailer` is not something you can use in the browser. You need to run it in `node` (on the server). So we need some kind of API routes. In `vinxi`, you can add a server handler for an API to your app.

```ts
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
      type: "spa",
      handler: "./index.html",
      base: "/",
      plugins: () => [
        config("custom", {
          // additional vite options
        }),
        // additional vite plugins
      ],
    },
    {
      name: "api",
      type: "http",
      handler: "./api.ts",
      base: "/api",
    },
  ],
});
```

```ts [api.ts]
import nodemailer from "nodemailer";
import { eventHandler } from "vinxi/http";

export default eventHandler(async (event) => {
  await nodemailer.sendMail({
    from: "",
  });

  return "done";
});
```

You can now hit `http://localhost:3000/api` from your frontend to send an email.
