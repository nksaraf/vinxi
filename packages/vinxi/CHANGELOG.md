# vinxi

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
