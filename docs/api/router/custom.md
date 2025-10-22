# Custom Router API

The Custom Router allows for defining routers with custom behavior or configurations that don’t fit into the predefined router types. It’s useful for advanced or specialized use cases.

## Configuration Options

### type

- Type: `{ resolveConfig: (router: Router, app: App) => Router }`
- Required: `true`

Unlike all other routers, rather than a string literal, custom routers are defined by passing defining the `type` as an object with a `resolveConfig` function.

### name

- Type: `string`
- Required: `true`

A unique identifier for the router.

### handler

- Type: `string`
- Required: `true`

The entry point file for Nitro server handling HTTP requests.

### target

- Type: `'server'`
- Required: `true`

Unlike all other routers where `target` is implied by the `type`, for custom routers the string literal `'server'` must be passed explicitly, as is currently the only option.

### base

- Type: `string`
- Required: `false`
- Default value: `'/'`

The base URL path under which the client application will be served.

### plugins

- Type: `() => Plugin[]`
- Required: `false`

A function returning an array of Vite plugins to use during the build process.

[Learn more about configuring Vite plugins](../../guide/vite-plugins.md)

### routes

- Type: `(router: ServiceSchemaInput, app: AppOptions) => CompiledRouter`
- Required: `false`

A function defining the routing logic or structure.

[Learn more about Vinxi's file system routing.](../../guide/file-system-routing.md)

### outDir

- Type: `string`
- Required: `false`

The output directory for build artifacts.

### root

- Type: `string`
- Required: `false`

The root directory for resolving paths. Defaults to the application's root directory.

## Example Configuration

```ts
{
  name: "customRouter",
  type: {
    resolveConfig: (router, app) => {
      // Custom configuration logic
    },
  },
  handler: "./app/customHandler.ts",
  target: "server",
}
```
