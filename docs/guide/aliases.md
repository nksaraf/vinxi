# Path Aliases

It's usually annoying to type long import paths relative to a deep file structure. For example, if you have a file located at src/components/atoms/Button/Button.jsx, and you need it in a page, like src/routes/app/dashboard/settings/index.jsx, you would have to write:

::: code-group

```ts [src/routes/app/dashboard/settings/index.jsx]
import Button from "../../../../components/atoms/Button/Button";
```

Hello
:::

While IDEs like VSCode can auto-complete the path for you, it is still annoying to correct, and read. To solve this, we can use typescript to added aliases for the most common paths. You can now write:

::: code-group

```json [tsconfig.json]
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "allowJs": true,
    "checkJs": true,
    "noEmit": true,
    "types": ["vinxi/types/client"],
    "isolatedModules": true,
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

:::

Now, you can import Button like this:

::: code-group

```ts [src/routes/app/dashboard/settings/index.jsx]
import Button from "@/components/atoms/Button/Button";
```

:::

You can import any module in your directory by its project path starting with @/.

While this is sufficient for typescript to understand what your are trying to do, you will need to configure your bundler to understand this as well. For vinxi, the best way to do this is to use the `vite-tsconfig-paths` plugin.

::: code-group

```bash [npm]
npm install vite-tsconfig-paths -D
```

```bash [yarn]
yarn add vite-tsconfig-paths -D
```

```bash [pnpm]
pnpm install vite-tsconfig-paths -D
```

```bash [bun]
bun install vite-tsconfig-paths -D
```

:::

::: code-group

```ts [app.config.js]
import { createApp } from "vinxi";
import tsconfigPaths from "vite-tsconfig-paths";

export default createApp({
  routers: [
    {
      base: "/",
      name: "server",
      type: "http",
      plugins: () => [tsconfigPaths()],
    },
  ],
});
```

:::

Now, your aliases will work everywhere in your app. Remember to add the `vite-tsconfig-paths` plugin to all the routers that might need to resolve such imports. By rule of hand, that would be all the routers that are not `type: "static"`.

So, if you have a typical SSR app with server functions, you need to add the plugin to all three routers.

::: code-group

```ts [app.config.js]
import { serverFunctions } from "@vinxi/server-functions/plugin";
import { createApp } from "vinxi";
import solid from "vite-plugin-solid";

export default createApp({
  routers: [
    {
      name: "public",
      type: "static",
      dir: "./public",
      base: "/",
    },
    {
      name: "ssr",
      type: "http",
      base: "/",
      handler: "./app/server.tsx",
      target: "server",
      plugins: () => [tsconfigPaths(), solid({ ssr: true })],
      link: {
        client: "client",
      },
    },
    {
      name: "client",
      type: "client",
      handler: "./app/client.tsx",
      target: "browser",
      plugins: () => [
        tsconfigPaths(),
        serverFunctions.client(),
        solid({ ssr: true }),
      ],
      base: "/_build",
    },
    serverFunctions.router({
      plugins: () => [tsconfigPaths()],
    }),
  ],
});
```

:::
