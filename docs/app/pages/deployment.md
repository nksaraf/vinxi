# Deployment

Vinxi allows you to deploy the same app anywhere: any platform, any runtime. This is made possible by amazing preset system built by nitro.

To build your app for a certain platform, use the `SERVER_PRESET` environment variable. For example, to build your app for bun, use `SERVER_PRESET=bun npm run build`.

This list of supported presets are:

- `vercel`
- `vercel-edge`
- `vercel-static`
- `bun`
- `deno-server`
- `deno-deploy`
- `node-cli`
- `node-server`
- `node`
- `static`
- `winterjs`
- `cloudflare-pages`
- `cloudflare-module`
- `cloudflare`
- `zeabur`
- `stormkit`
- `service-worker`
- `render-com`
- `netlify`
- `netlify-edge`
- `netlify-builder`
- `netlify-static`
- `lagon`
- `layer0`
- `iis`
- `heroku`
- `github-pages`
- `flightcontrol`
- `firebase`
- `edgeio`
- `digital-ocean`
- `aws-amplify`
- `azure`
- `azure-functions`
- `aws-lambda`

