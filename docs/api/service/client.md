# Client Service API

The `client` service is a wrapper for Vite’s build processes and development server, allowing for easy integration with an `http` service for server-side rendering applications.

## Configuration Options

### type

- Value: `'client'`

### name

- Type: `string`
- Required: `true`

A unique identifier for the service.

### handler

- Type: `string`
- Required: `true`

The entry point file for the client application.

### base

- Type: `string`
- Required: `false`
- Default value: `'/'`

The base URL path under which the built assets for client application will be served.

::: tip
As client service is mostly built assets, its good to use `base` for namspacing these assets in order to avoid conflicts, eg. `"/_build"`
:::

### plugins

- Type: `() => Plugin[]`
- Required: `false`

A function returning an array of Vite plugins to use during the build process.

[Learn more about configuring Vite plugins](../../guide/vite-plugins.md)

### routes

- Type: `(service: ServiceSchemaInput, app: AppOptions) => Compiledservice`
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
  name: "client",
  type: "client",
  handler: "./app/client.tsx",
  base: "/_build",
  plugins: () => [ reactRefresh() ],
}
```
