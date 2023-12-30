# vinxi

## 0.0.60

### Patch Changes

- 1261c16: feat: add process.env.MINIFY support for build, add preserveEntrySignatures fix (fixes [Issue] Plugin is not working #44)
  - @vinxi/devtools@0.0.5

## 0.0.59

### Patch Changes

- 44f46ae: fix syntax in load-app file
  - @vinxi/devtools@0.0.5

## 0.0.58

### Patch Changes

- b654e60: chore: remove logging of fs routes
  - @vinxi/devtools@0.0.5

## 0.0.57

### Patch Changes

- ff03255: chore: fix logging and make hooks only log in DEBUG mode
- 783d22b: (feat): native bun support, without any other module loader, runtime detection for all cli commands
- 0160b5c: (perf): avoid jiti if loading a js/mjs/cjs file
  - @vinxi/devtools@0.0.5

## 0.0.56

### Patch Changes

- d5262b3: (feat): add additional CLI shortcuts (u -> show URL, h -> show help, r -> restart dev server)
- 5694f29: (feat): support devProxy nitro options, in vinxi dev server
  - @vinxi/devtools@0.0.5

## 0.0.55

### Patch Changes

- 88201f3: use file url to import server in start command
- cbba2d7: fix: normalize paths from fs watcher
- c5a94cf: (feat): deep support for `server.baseURL` API from nitro in dev & prod,
- e53f24a: (fix): decorate exports use parse-advanced, fixes #36
- 9325a54: (feat): css modules support
- a0974f0: (fix): css hmr happens in vinxi/client for all css assets, not only for lazyRoutes
- c4b76ed: Add 'r' keypress to restart dev server
- 7af0a15: (fix): static assets imports in server side handler
  - @vinxi/devtools@0.0.5

## 0.0.54

### Patch Changes

- 7ec78e2: remove console logs, nit
  - @vinxi/devtools@0.0.5

## 0.0.53

### Patch Changes

- b601463: keep vite 4 (for now) and bug fix in wrap exports (@vinxi/plugin-directives)
- 68cab94: vite 5
  - @vinxi/devtools@0.0.5

## 0.0.52

### Patch Changes

- 366b29b: fix: include more than css assets
  - @vinxi/devtools@0.0.5

## 0.0.51

### Patch Changes

- 7276f73: fix prerender twice
  - @vinxi/devtools@0.0.5

## 0.0.50

### Patch Changes

- e4a6251: remove build aliases to fix pre-render
  - @vinxi/devtools@0.0.5

## 0.0.49

### Patch Changes

- 0f9a5df: route rules for dev server
- e6205a4: prerender
- d8ef7c9: fix: clean up old console logs
- e7313f4: feat: vinxi start command (just works with node target right now)
  - @vinxi/devtools@0.0.5

## 0.0.48

### Patch Changes

- fc7494d: fix: --port flag for the dev server
- 4e4c047: make server functions worker work
- 8ef044b: feat: add wrapper for server functions on the server
  - @vinxi/devtools@0.0.5

## 0.0.47

### Patch Changes

- 8d24beb: improve path handling in windows, and the server-action handler
  - @vinxi/devtools@0.0.5

## 0.0.46

### Patch Changes

- a4512f5: new CLI infra using citty and server-function fix
  - @vinxi/devtools@0.0.5

## 0.0.45

### Patch Changes

- 8d1f0dd: fix: add stacks to package.json files
  - @vinxi/devtools@0.0.5

## 0.0.44

### Patch Changes

- b0029a2: added a stacks feature to quickly build up app config from the CLI (experimental)
- cbd8d4c: added boxes for build logging to make it prettier
- 0cc2f4a: added `import()` helpers to manifest
  - @vinxi/devtools@0.0.5

## 0.0.43

### Patch Changes

- 978b04a: move back to vite 4
  - @vinxi/devtools@0.0.5

## 0.0.42

### Patch Changes

- e8fdad4: fix spa router manifest in prod
- 291a5cf: only inject runtime client during dev (serve)
  - @vinxi/devtools@0.0.5

## 0.0.41

### Patch Changes

- 2e52d87: fix server functions resolve conditions order, middleware
  - @vinxi/devtools@0.0.5

## 0.0.40

### Patch Changes

- 0335776: fix server components resolve, inject
  - @vinxi/devtools@0.0.5

## 0.0.39

### Patch Changes

- f237894: add hookable hooks to vinxi app
- d620072: add hmr for the app config file itself
- Updated dependencies [6fd5455]
  - @vinxi/devtools@0.0.5

## 0.0.38

### Patch Changes

- 1284791: Added @vinxi/server-functions support and chunking in vinxi
- Updated dependencies [930b2f2]
  - @vinxi/devtools@0.0.4

## 0.0.37

### Patch Changes

- 6ff575e: add devtools flag to vinxi, enabled by default
- f2cbc3c: --force flag
- b437331: add vite-plugin-inspect to devtools
- e87800e: fix order of built routers based on base length
- Updated dependencies [2cf0023]
- Updated dependencies [6ff575e]
- Updated dependencies [b437331]
  - @vinxi/devtools@0.0.3

## 0.0.36

### Patch Changes

- 49e4e03: better types for router and custom modes
- a009733: move doc out of vinxi core

## 0.0.35

### Patch Changes

- Updated dependencies [5b0304b]
  - @vinxi/doc@0.0.2

## 0.0.34

### Patch Changes

- 355daea: move vinxi/path to vinxi/lib/path

## 0.0.33

### Patch Changes

- 1dec590: fix bug with externalizing vinxi subpaths

## 0.0.32

### Patch Changes

- 982147a: add plugin type export

## 0.0.31

### Patch Changes

- 94f59aa: refactor internals to have user customizable modes
- bc82d8e: refactor vinxi entrypoints to make them simpler, better typescript
- 1d8b542: fix types
- 5bf5e03: fix types and unnecessary comments
- 4c7fd35: fix: hmr broken
- 0f4b3ee: windows support
- ad62318: experimental websocket support (doesn't work yet, waiting on dependencies)
- c223ab6: use pathe everywhere
- 94f59aa: fixes

## 0.0.30

### Patch Changes

- fd06048: fix prod-server-manifest to handle #vinxi/handler properly
- 0f14555: changed `style` to `routes` and removed `compile` nested, flat options API
- 82267c5: move `build` to `compile` and more flexible `router.style` config

## 0.0.29

### Patch Changes

- 8058084: fix bug in style collector related to node builtins

## 0.0.28

### Patch Changes

- b934e84: bump listhen version to 1.5.0
- 17693dc: remove console logs
- d6305b8: start middleware API
- cb91c48: fixes to middleware PAI
- 085116d: externalize h3 from vite builds so its only included once in the final server build
- f1ee5b8: finish middleware API

## 0.0.27

### Patch Changes

- 7803042: fix: add types for createMiddleware

## 0.0.26

### Patch Changes

- 2b17e0d: add createMiddleware API

## 0.0.25

### Patch Changes

- 552d8ca: added spa mode with js/ts handler that will server render your html file during dev and build

## 0.0.24

### Patch Changes

- 47abc3c: change "node" target to "server"

## 0.0.23

### Patch Changes

- 46f3426: bump fixes

## 0.0.22

### Patch Changes

- 5834c1a: add changesets support
