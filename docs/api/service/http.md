# HTTP Service API

The `http` service is a wrapper of a Nitro web server, with all the flexibility that entails. Great for server side rendering, websockets, custom API endpoints, etc...

## Configuration Options

### type

- Value: `'http'`

### name

- Type: `string`
- Required: `true`

A unique identifier for the service.

:::tip
The name of the service that the code is currently executing can be imported from `vinxi/manifest`.

```ts
import { serviceName } from "vinxi/manifest";

export default eventHandler(() => {
  const serverManifest = getManifest(serviceName);
  const clientManifest = getManifest("react-client");
});
```

:::

### handler

- Type: `string`
- Required: `true`

The entry point file for Nitro server handling HTTP requests.

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

- Type: `(service: ServiceSchemaInput, app: AppOptions) => Compiledservice`
- Required: `false`

A function defining the routing logic or structure.

[Learn more about Vinxi's file system routing.](../../guide/file-system-routing.md)

## middleware

- Type: `string`
- Required: `false`

Path to server middleware to apply to the service.

### worker

- Type: `boolean`
- Required: `false`
- Default value: `false`

Configures the service to run its request-handling in a separate worker thread.

### build

- Type: `boolean`
- Required: `false`
- Default value: `true`

Include the service in the build process.

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
  name: "server",
  type: "http",
  handler: "./app/apiHandler.ts",
  base: "/api",
  worker: true,
  plugins: () => [ reactRefresh() ],
}
```
