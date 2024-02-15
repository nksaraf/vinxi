# File System Routing

#### (Experimental)

As the number of sub-routes grows, it becomes tedious to write out each route by hand. Make sure to code split it, import it, include it in the main handler, etc. File system routing allows you to define routes in separate files and the handler can produce a route tree based on the file system structure and the names of the files.

Unlike most file system routing solutions, Vinxi doesn't care about what your preferred file system routing convention is. All it needs to know is what files are part of the route tree (there could be multiple files mapping to a route). Vinxi will take care of everything from HMR for the route tree, associating assets with routes, bundling them appropriately, etc.

A file system router can be added to a Vinxi router using the `router.routes` option. The `routes` option expects a function that returns a `CompiledRouter`

```ts
interface CompiledRouter extends EventTarget {
  getRoutes: () => Promise<Route[]>;
}
```

A `CompiledRouter` is a router class that tells `vinxi` what sources need to be compiled as routes. The core functionality of a `CompiledRouter` is to provide a `getRoutes` function that returns an array of routes. Each route is a plain javascript object with any fields you want. Typically you would have a `path` field that would be the mapping between the route filename and the router path. And any number of references to the files that are used as the handlers for that route.

```ts
type Route = {
  path: string;
  [key: `$$${string}`]: {
    src: string;
    pick?: string[];
  };
};
```

To add a file dependency to a route, add a field with a `$`/`$$` prefix. A `$$` prefix means that the file will be imported statically in the routes module, and thus will be bundled with the main bundle. A `$` prefix means that the file will be imported dynamically, and thus will be bundled in a separate chunk.

<Info>
The `$` prefix is the easiest way to do code-splitting based on routes, a natural splitting point for your code chunks. 
</Info>

<Info>
Only use `$$` for critical information required for the whole application to function and where the laatency caused by requiring a network call is unacceptable.
</Info>

Building a fully fledged `CompiledRouter` involves taking care of glob matching, extensions, HMR, caching, and keeping track of the routes. Vinxi provides a helper class called `BaseFileSystemRouter` from `vinxi/fs-router` that can be extended to create your own file system router. It takes care of glob matching, extensions, HMR, caching, and keeping track of the routes. All you need to do is implement the `toPath` and `toRoute` methods. The `toPath` method takes a file path and returns a route path. The `toRoute` method takes a file path and returns a route object that is provided to the app using the `vinxi/routes` module.

::: code-group

```ts [app.config.js]
import { BaseFileSystemRouter } from "vinxi/fs-router";

class MyFileSystemRouter extends BaseFileSystemRouter {
  toPath(filePath) {
    return filePath.replace(/\.js$/, "");
  }

  toRoute(filePath) {
    return {
      path: this.toPath(filePath),
      $handler: {
        src: filePath,
        pick: ["default"],
      },
    };
  }
}

export default createApp({
  routers: [
    {
      routes: (router, app) => {
        return new MyFileSystemRouter(
          {
            dir: path.join(__dirname, "app/routes"),
            extensions: ["jsx", "js", "tsx", "ts"],
          },
          router,
          app,
        );
      },
    },
  ],
});
```

```ts vinxi/routes
export default [
  {
    path: "/hello",
    $component: {
      src: "app/routes/hello.tsx?pick=default",
      import: async () => {
        return await import("app/routes/hello.tsx?pick=default");
      },
    },
  },
];
```

:::

You can add multiple file dependencies (whether that is different exports from the same file, or multiple files)

::: code-group

```ts [app.config.js]

class MyFileSystemRouter extends BaseFileSystemRouter {
  toPath(filePath) {
    return filePath.replace(/\.js$/, "");
  }

  toRoute(filePath) {
    return {
      path: this.toPath(filePath),
      $handler: {
        src: filePath,
        pick: ["default"]
      }
      $$config: {
        src: filePath,
        pick: ["config"]
      }
      $data: {
        src: filePath.replace(/\.js$/, ".data.ts"),
        pick: ["default"]
      }
    };
  }
}

```

```ts vinxi/routes
import * as mod from "app/routes/hello.tsx?pick=config";

export default [
  {
    path: "/hello",
    $component: {
      src: "app/routes/hello.tsx?pick=default",
      import: async () => {
        return await import("app/routes/hello.tsx?pick=default");
      },
    },
    $$config: {
      src: "app/routes/hello.tsx?pick=config",
      require: () => {
        return mod;
      },
    },
    $data: {
      src: "app/routes/hello.data.ts?pick=default",
      import: async () => {
        return await import("app/routes/hello.data.ts?pick=default");
      },
    },
  },
];
```

:::
