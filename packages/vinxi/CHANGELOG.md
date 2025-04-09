# vinxi

## 0.5.4

### Patch Changes

- 6bb17d02: Update Nitro to 2.11.1
- 1f899056: feat: allow custom HMR configuration on a per router basis
- 6d71612e: feat: allow custom `clearScreen` configuration

## 0.5.3

### Patch Changes

- 09cd59b1: enable vite mode flag via cli
- 696defe4: Fix a regression that caused css imported with sideeffects such as `?url`, to be rendered during ssr (in dev).
- fd93107b: fix: use CLI-given config file

## 0.5.2

### Patch Changes

- b85ab82c: Update unstorage

## 0.5.1

### Patch Changes

- db9b7747: Update collect-styles.js to use ?inline to get the css during ssr

## 0.5.0

### Minor Changes

- 168cef26: Bump to Vite 6
- 2a298125: chore: bump nitro to v2.10.4, h3 to v13.0

### Patch Changes

- af82995d: feat: nitro plugin support in dev
- c261150c: fix Asset type

## 0.4.3

### Patch Changes

- 2b526da8: add "license" field to library package.json files
- b2ff2145: fix: add partial for setResponseHeaders
- 1b4381a0: Add support for Vite --mode
- 3a4ad779: Remove js bundles from the public directory for routers with a type of 'http' and targetting 'server'
- af8381df: Re-export useBase
- f0a1c26c: fix: hash chunks with djb2

## 0.4.2

### Patch Changes

- f1f81b0c: Update package.json
- 8707a798: perf: run each router build in separate node processes

## 0.4.1

### Patch Changes

- 4bf73294: fix #338 add readme to Vinxi package
- f1e17602: fix #332 - dramatic performance improvement of findAssetsInViteManifest

## 0.4.0

### Minor Changes

- 8cbae91: virtual routes module

## 0.3.14

### Patch Changes

- c745546: fix missing null check on css exclusion

## 0.3.13

### Patch Changes

- bdd5a11: fix automatic deployment detection by not forcing node preset
- 308d489: Fixed a bug in the dev style collection that resulted in flashes of unstyled content.
- f289889: Fixed casing of `fetchPriority` according to the HTML standard.
- ce9c269: fix: vite plugin assets order
- 0208a90: Change host to string for start command, to be able to set host

## 0.3.12

### Patch Changes

- 2f6e51c: fix: https type def
- 0afc6ee: fix: style order in dev mode
- 35259d3: Fix react ssr effect waring
- 7b590e0: Vinxi now always runs Vite vanilla css hot updates, after Vinxis custom update logic. In particular this fixes hot updates for css files imported via `?url`.
- 635df64: Swapped all virtual #vinxi references to $vinxi to be compatible with node imports
- 3b0e0d5: fix: css module hmr update
- 16d8949: fix: solidjs/solid-start#1401, css ref counting in dev
- 23edbdd: Replaced stylesheet `precendence` attribute with `fetchpriority`.
- dc786b2: Add ./dist/types exports to package.json
- 49fefb8: chore(vinxi): ensure installing vinxi only install one esbuild version
- 0d6b09b: server functions: allow get requests

## 0.3.11

### Patch Changes

- 104613d: fix: remove boxen dependency (cjs), fixes cloudflare_pages deployment
- 3a3d23f: fix: transpile deps that begin with @vinxi/\*
- e6f9faf: fix: allow serving resource files from monorepo in dev server
- 1c67f7f: feat: don't crawl for styles in node_modules
- f849ff3: fix: loadApp refactor, better types, remove stacks for now

## 0.3.10

### Patch Changes

- 4caab63: fix: rsc ssr example, remove vinxi devtools for now

## 0.3.9

### Patch Changes

- ca7b28b: fix: dont log error if error loading module during collect-styles phase raw-imports result in warnings in dev-mode #226
- 38a6d0d: fix: vinxi/react ready for RSC
  - @vinxi/devtools@0.2.0

## 0.3.8

### Patch Changes

- 7a597bf: feat: update config function signature
  - @vinxi/devtools@0.2.0

## 0.3.7

### Patch Changes

- 54214a7: fix: mjs chunks and rsc example fix
  - @vinxi/devtools@0.2.0

## 0.3.6

### Patch Changes

- 55fde20: fix: cssMinify enabled by default for both ssr and cliet
- 25093a5: fix: fix .ts config file extensions in load-app.js
  - @vinxi/devtools@0.2.0

## 0.3.4

### Patch Changes

- af337ca: feat: `vinxi version`, shows vite, nitro, h3 versions in vinxi cli
- bd2dc5d: fix: add prerender initialization hook to accept app config as vite config
  - @vinxi/devtools@0.2.0

## 0.3.3

### Patch Changes

- 27c77c4: fix: vinxi run expose vinxi/http, vinxi/listen, vinxi/storage, and vinxi/sh
  - @vinxi/devtools@0.2.0

## 0.3.2

### Patch Changes

- 472702a: fix: add vinxi aliases to run command so it can run without vinxi in package json
  - @vinxi/devtools@0.2.0

## 0.3.1

### Patch Changes

- 3a3573f: fix: cache dir should be in node_modules for vite to work properly, f…
  - @vinxi/devtools@0.2.0

## 0.3.0

### Minor Changes

- 5e904e3: vite 5 and fixes

### Patch Changes

- b039359: fix: Update chunk and entry file names in server components to always use .js extension
- ca63e63: fix: catch errors in fs-router fixes #100
- a109c52: feat: Reexporting type CookieSerializeOptions from 'cookie-es', used by cookie helpers
- fd2d5e4: fix: separate vite cache dirs for different routers
  - @vinxi/devtools@0.2.0

## 0.2.1

### Patch Changes

- b25063b: fix: httpevent types
  - @vinxi/devtools@0.2.0

## 0.2.0

### Minor Changes

- d2fcee6: feat: vinxi/http package for all the http server related utilities (vinxi/server reexports)

### Patch Changes

- 0c92d33: breaking: `mode` option on routers has been renamed to `type`
- 2670f50: breaking: change "build" router type to "client"
- 4a14764: breaking: update "handler" router types to "http"
- Updated dependencies [d2fcee6]
- Updated dependencies [0c92d33]
- Updated dependencies [2670f50]
- Updated dependencies [4a14764]
  - @vinxi/devtools@0.2.0

## 0.1.10

### Patch Changes

- 1e753a1: fix: event checking logic in vinxi/server checks for HTTPEventSymbol or **is_event**:true
  - @vinxi/devtools@0.1.1

## 0.1.9

### Patch Changes

- a1053ac: feat: `getManifest(routerName)` API to access Manifest API for a router, (instead of import.meta.env.MANIFEST)
  - @vinxi/devtools@0.1.1

## 0.1.8

### Patch Changes

- 6dc46ae: fix: server helpers not accepting h3Event symbol
  - @vinxi/devtools@0.1.1

## 0.1.7

### Patch Changes

- c51406c: fix: app.server.baseURL support for SPA builds
- 8ec296f: feat: add vinxi serve command (static file server), options --dir, --host, --port, --base
- b4b4540: feat: wrap h3 functions so that they can be run without an event under async context
- d0e516b: chore: update h3 to 1.10.1 and remove session fix
  - @vinxi/devtools@0.1.1

## 0.1.6

### Patch Changes

- 8bfc1b6: feat: ssr/client dedupe asset urls using `link` API
- 35cd983: fix(vinxi-mdx): provide file path to rehype transform
- ba47f41: feat: allow setting Nitro log level during build using NITRO_LOG_LEVEL env var
- 181903c: fix: vinxi/react jsx -> js, add types
- 17f6891: fix: move app.d.ts app-types.d.ts and update tsc script
  - @vinxi/devtools@0.1.1

## 0.1.5

### Patch Changes

- 557b35c: feat: make https configurable for dev, use `server.dev.https: true` or `server.dev.https: options`
- 922a51b: bump listhen (fork) to 1.5.6 with resolveCertificate exported
- fae6e44: fix: @vinxi/plugin-directives: Add onModuleFound callback to shimExportsPlugin, fixes #129, solidjs/solid-start#1261
  - @vinxi/devtools@0.1.1

## 0.1.4

### Patch Changes

- ee9611f: fix: proper source maps and handling ts declaration functions with vinxi/plugin-directives
- 2dad740: fix: server runtime types in package.json
  - @vinxi/devtools@0.1.1

## 0.1.3

### Patch Changes

- 583364f: fix: concurrent getSession calls
- c45633c: upstreams Fix server functions hanging on edge functions solidjs/solid-start#1255
- fd5740c: fix: non-blocking `readBody` with web requests
  - @vinxi/devtools@0.1.1

## 0.1.2

### Patch Changes

- 769a055: fix: config changes not applied on server restart
- 08cd450: fixes Exporting type definitions from a "use server" file doesn't work. #106
- 2e85423: findAssetsInViteManifest: Prevent recursive parsing of same ids
- bb16563: fix: toWebRequest lazily creates readable stream for `body` access
- a011795: fixes css bundling differences and issues between file-based routes and config-based routes #115
  - @vinxi/devtools@0.1.1

## 0.1.1

### Patch Changes

- 9c60b73: devtools out
- Updated dependencies [9c60b73]
  - @vinxi/devtools@0.1.1

## 0.1.0

### Minor Changes

- e31abb2: chore: bring things to 0.1.x

### Patch Changes

- b2ef06f: replace passthrough with fallthrough
- Updated dependencies [e31abb2]
  - @vinxi/devtools@0.1.0

## 0.0.64

### Patch Changes

- 2c65c91: feat: multiple SPA routers
- 8c87b24: fix: preset always node-server because of cli default
  - @vinxi/devtools@0.0.5

## 0.0.63

### Patch Changes

- 6f695e2: fix: css asset href is relative
  - @vinxi/devtools@0.0.5

## 0.0.62

### Patch Changes

- b236b2a: fix: remove nitro minify
  - @vinxi/devtools@0.0.5

## 0.0.61

### Patch Changes

- 86982a4: fix: await plugins in server functions/comoponents overrides
- b7332a6: fix: reset req.url for vite middleware
  - @vinxi/devtools@0.0.5

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
