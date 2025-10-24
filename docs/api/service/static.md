# Static Service API

The `static` service allows for serving static assets (like images, fonts, etc...) from a specified directory without any compilation step.

## Configuration Options

### type

- `'static'`

### name

- Type: `string`
- Required: `true`

A unique identifier for the service.

### dir

- Type: `string`
- Required: `true`

The directory containing the static assets relative to `root`.

### base

- Type: `string`
- Required: `false`
- Default value: `'/'`

The base URL path under which the static assets will be served. Defaults to "/".

### root

- Type: `string`
- Required: `false`

The root directory for resolving the dir path. Defaults to the application’s root directory.

## Example Configuration

```ts
{
  name: "public",
  type: "static",
  dir: "./public",
}
```
