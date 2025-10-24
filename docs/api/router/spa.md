# SPA Router API

The `spa` router specifies a single entrypoint for serving of single page applications.

## Configuration Options

### type

- Value: `'spa'`

### name

- Type: `string`
- Required: `true`

A unique identifier for the router.

### handler

- Type: `string`
- Required: `true`

The HTML file or entry point for the SPA.

### base

- Type: `string`
- Required: `false`
- Default value: `'/'`

The base URL path under which the SPA will be served.

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
  name: "spa",
  type: "spa",
  handler: "./index.html",
  plugins: () => [tsconfigPaths()],
}
```
