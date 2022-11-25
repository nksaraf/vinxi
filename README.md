![Composer Suite](https://user-images.githubusercontent.com/1061/189347136-c81b7807-dbbc-4d8f-a890-b9d6639165b0.jpg)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg?style=for-the-badge)](CODE_OF_CONDUCT.md)

### A suite of libraries for making game development with Three.js and React not only awesome, but "so good, it would feel wrong to use anything else." – [hmans](https://github.com/sponsors/hmans)

Building games with React and Three.js is already pretty cool, but a lot of tooling you need to make those games _really nice_ is still missing. This project tries to fill some of these gaps by providing a collection of libraries for various aspects of game development, from **GPU-driven particle systems and VFX**, to **game UI**, **editor tooling**, **camera rigs**, **audio**, **multi-device input**, and more.

> **Note**
> While this suite of libraries targets building games with [React](https://reactjs.org/) and [React-Three-Fiber], some of them can also be used outside of React, just like some others are not specific to Three.js or React-Three-Fiber. But building games with React is where our hearts are at, which is why you will find most example code in this document to be written in React. 😎

## Sponsors ❤️

This project wouldn't be possible without the support from its lovely [sponsors](https://github.com/sponsors/hmans). If you'd like to sponsor this project and help **make game development with React & Three.js incredible**, [click here](https://github.com/sponsors/hmans)!

<!-- sponsors --><a href="https://github.com/kenjinp"><img src="https://github.com/kenjinp.png" width="60px" alt="Kenneth Pirman" /></a><a href="https://github.com/czottmann"><img src="https://github.com/czottmann.png" width="60px" alt="Carlo Zottmann" /></a><a href="https://github.com/verekia"><img src="https://github.com/verekia.png" width="60px" alt="Jonathan Verrecchia" /></a><a href="https://github.com/djradon"><img src="https://github.com/djradon.png" width="60px" alt="Dave Richardson" /></a><a href="https://github.com/souporserious"><img src="https://github.com/souporserious.png" width="60px" alt="Travis Arnold" /></a><a href="https://github.com/MSNexploder"><img src="https://github.com/MSNexploder.png" width="60px" alt="Stefan Stüben" /></a><a href="https://github.com/jorgenbuilder"><img src="https://github.com/jorgenbuilder.png" width="60px" alt="Jorgen Hookham" /></a><a href="https://github.com/perplex-gg"><img src="https://github.com/perplex-gg.png" width="60px" alt="perplex.gg" /></a><a href="https://github.com/darrinm"><img src="https://github.com/darrinm.png" width="60px" alt="Darrin Massena" /></a><a href="https://github.com/gsimone"><img src="https://github.com/gsimone.png" width="60px" alt="Gianmarco" /></a><a href="https://github.com/zklain"><img src="https://github.com/zklain.png" width="60px" alt="Zdenko Klain" /></a><a href="https://github.com/chasedavis"><img src="https://github.com/chasedavis.png" width="60px" alt="Chase Davis" /></a><a href="https://github.com/chrisco255"><img src="https://github.com/chrisco255.png" width="60px" alt="Chris Cordle" /></a><a href="https://github.com/EngynWuck"><img src="https://github.com/EngynWuck.png" width="60px" alt="" /></a><a href="https://github.com/DevMartinese"><img src="https://github.com/DevMartinese.png" width="60px" alt="Gonzalo Martinese" /></a><a href="https://github.com/triptych"><img src="https://github.com/triptych.png" width="60px" alt="Andrew Wooldridge" /></a><!-- sponsors -->

## Getting Started

**Most of the packages in this repository are under heavy development**, and even though I regularly [push new bits to NPM](https://github.com/hmans/composer-suite/releases), expect much of it to be largely undocumented and unstable, particularly anything that has yet to reach version 1.0.0.

If you'd like to give this stuff a try today, the easiest way would be to either clone this repository to your local computer and run one of the many example apps (or the demo game, Space Rage; see below). Alternatively, you can also [open this repository on CodeSandbox](https://codesandbox.io/p/github/hmans/composer-suite/main?file=%2FREADME.md) and play with the code there!

## Space Rage

![spacerage-banner](https://user-images.githubusercontent.com/1061/194765077-4e1e1086-6596-474a-aab0-aec9d92f8fbd.jpg)

The development of the Composer Suite is primarily driven by that of **Space Rage**, an open-source top-down twin-stick shooter game that is also intended to be a showcase for the libraries here.

- **[Play Space Rage](https://spacerage2.vercel.app/)** (development build!)
- [Play and edit Space Rage in CodeSandbox](https://codesandbox.io/p/github/hmans/composer-suite/dev?selection=%5B%7B%22endColumn%22%3A31%2C%22endLineNumber%22%3A21%2C%22startColumn%22%3A31%2C%22startLineNumber%22%3A21%7D%5D&file=%2Fapps%2Fspacerage%2Fsrc%2FGame.tsx&workspace=%257B%2522activeFileId%2522%253A%2522cl90xdiuf00eblqjedryebrxi%2522%252C%2522openFiles%2522%253A%255B%2522%252Fapps%252Fspacerage%252Fsrc%252FGame.tsx%2522%255D%252C%2522sidebarPanel%2522%253A%2522EXPLORER%2522%252C%2522gitSidebarPanel%2522%253A%2522COMMIT%2522%252C%2522sidekickItems%2522%253A%255B%257B%2522type%2522%253A%2522PREVIEW%2522%252C%2522taskId%2522%253A%2522dev%253Aspacerage%2522%252C%2522port%2522%253A5173%252C%2522key%2522%253A%2522cl91i035f01eu3b6me2xd6clq%2522%252C%2522isMinimized%2522%253Afalse%257D%252C%257B%2522type%2522%253A%2522TASK_LOG%2522%252C%2522taskId%2522%253A%2522dev%253Aspacerage%2522%252C%2522key%2522%253A%2522cl91hzzw2018b3b6mno4aayug%2522%252C%2522isMinimized%2522%253Afalse%257D%255D%257D)
- [Source code](https://github.com/hmans/composer-suite/tree/main/apps/spacerage)

## Packages 📦

[![Shader Composer](https://user-images.githubusercontent.com/1061/187867434-1e8bc952-8fed-4e17-afc6-fca97951ba1a.jpg)](https://github.com/hmans/composer-suite/tree/main/packages/shader-composer)  
![react] ![vanilla] ![three]

**[Shader Composer]** takes a graph of nodes (here called "units") and compiles it to a working GLSL shader. It provides a library of ready-to-use shader units, but you can, of course, add your own. Parameterized sub-graphs of your shaders can be implemented as plain JavaScript functions.

```jsx
const ShaderComposerExample = () => {
  const shader = useShader(() =>
    ShaderMaterialMaster({
      color: pipe(
        Vec3(new Color("red")),
        (v) => Mix(v, new Color("white"), NormalizePlusMinusOne(Sin(Time()))),
        (v) => Add(v, Fresnel())
      )
    })
  )

  return (
    <mesh>
      <sphereGeometry />
      <shaderMaterial {...shader} />
    </mesh>
  )
}
```

[![material-composer-thin](https://user-images.githubusercontent.com/1061/187885049-cdbbd4c6-b974-4214-a0de-916d9ee412bb.jpg)](https://github.com/hmans/composer-suite/tree/main/packages/material-composer)  
![react] ![vanilla] ![three]

**[Material Composer]** provides a mechanism to hook into Three.js materials and customize their behavior using a sequence of material modules. Modules are higher-level implementations of Shader-based functionality, and implemented using [Shader Composer]. Material Composer provides a library of these material modules that are easy to extend and customize; but, as always, you can add your own.

```jsx
const MaterialComposerExample = () => (
  <mesh position-y={1.5} castShadow>
    <sphereGeometry />

    <Composable.MeshStandardMaterial>
      <Modules.Color color="#d62828" />

      <Layer opacity={NormalizePlusMinusOne(Sin(Time()))}>
        <Modules.Color color="#003049" />
      </Layer>

      <Modules.Fresnel intensity={0.2} />
    </Composable.MeshStandardMaterial>
  </mesh>
)
```

[![VFX Composer](https://user-images.githubusercontent.com/1061/187867928-5cac4fa9-908c-4c78-93de-2a9ac3998dbd.jpg)](https://github.com/hmans/composer-suite/tree/main/packages/vfx-composer)  
![react] ![vanilla] ![three]

_TODO_

[![timeline-composer-thin](https://user-images.githubusercontent.com/1061/187868484-5cd3ebd6-7961-4fd3-aef0-eca22f79417a.jpg)](https://github.com/hmans/composer-suite/tree/main/packages/timeline-composer)  
![react]

**[Timeline Composer]** provides a small, but powerful collection of React components that can be used to orchestrate an animation sequence:

```jsx
<Lifetime seconds={5}>
  <SmokeRing />
  <Fireball />

  <Delay seconds={0.3}>
    <CameraShake decay />
    <Fireball />

    <Delay seconds={0.2}>
      <Rocks />
      <SmokeCloud />
    </Delay>
  </Delay>
</Lifetime>
```

### [Render Composer](https://github.com/hmans/composer-suite/tree/main/packages/render-composer)

![react] ![three]

A preconfigured, opinionated render pipeline for your React-Three-Fiber games.

_TODO_

### Input Composer

![react] ![vanilla]

Composable multi-device game input.

_TODO_

### UI Composer

![react]

Screen-space UI for games and game tooling.

_TODO_

### Camera Composer

![react] ![vanilla] ![three]

Composable camera automation.

_TODO_

### [State Composer](https://github.com/hmans/composer-suite/tree/main/packages/state-composer)

![react]

Helpers for managing game state.

_TODO_

## Development 🛠

### Repository Structure

The repository is structured as a monorepo. You will find all packages that are part of the Composer Suite inside the `packages` directory, and a collection of applications (examples and otherwise) inside `apps`.

### Development Mode

This repository uses [Preconstruct](https://preconstruct.tools/) for building packages and providing a development environment. To start the development environment, run:

```sh
pnpm dev:link
```

This will cause Preconstruct to link all apps and packages together so they consume each others' TypeScript source, allowing you to modify code without having to rebuild after every change.

### Running Example Apps

Use the `pnpm dev` task to start up all available apps in development mode, or supply a `--filter` argument to just start one of them. Examples:

```sh
# Start all apps
pnpm dev

# Start individual apps
pnpm dev --filter spacerage
pnpm dev --filter vfx-composer-examples
pnpm dev --filter shader-composer-examples
```

> **Note** The `pnpm dev` task uses [Turborepo](https://turbo.build/repo). Please refer to their [CLI Documentation](https://turbo.build/repo/docs/reference/command-line-reference) to learn about additional options.

### Core Tenets

All of the libraries in the Composer Suite are aiming for the following:

- **Authored in and for TypeScript**.  
  All libraries are authored in TypeScript, with first-class type support. This means that you can use these libraries in JavaScript, but you will get the best experience when using TypeScript. If you're using them from within JavaScript, please be aware that these libraries will not make any significant effort to provide runtime type checking or similar.
- **Flawless HMR**.  
  The libraries should provide a fun and flawless development experience with the best support for hot-module reloading possible. The user should be able to hot-reload their code and see the changes immediately in the browser. Where possible, state should be retained; there must never be errors when hot-reloading.
- **Prefer Declarative over Imperative**.  
  Where possible, allow the user to declare logic and data using JSX, instead of forcing them out of the declarative JSX layer and towards hooks (or even further into the imperative world.)
- **Usable Individually, and Together**.  
  Where possible, libraries should be designed so they can be used individually, but also together.

## License 👩‍⚖️

```
Copyright (c) 2022 Hendrik Mans

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

[react-three-fiber]: https://github.com/pmndrs/react-three-fiber
[shader composer]: https://github.com/hmans/composer-suite/tree/main/packages/shader-composer
[timeline composer]: https://github.com/hmans/composer-suite/tree/main/packages/timeline-composer
[vfx composer]: https://github.com/hmans/composer-suite/tree/main/packages/vfx-composer
[material composer]: https://github.com/hmans/composer-suite/tree/main/packages/material-composer
[react]: https://img.shields.io/badge/-react-blue?style=for-the-badge
[vanilla]: https://img.shields.io/badge/-vanilla-yellow?style=for-the-badge
[three]: https://img.shields.io/badge/-three-brightgreen?style=for-the-badge
