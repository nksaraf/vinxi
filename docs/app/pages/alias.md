Aliases

Its usually annoying to type long import paths relative to a deep file structure. For example, if you have a file located at src/components/atoms/Button/Button.jsx, and you need it in a page, like src/routes/app/dashboard/settings/index.jsx, you would have to write:

```ts
import Button from '../../../../components/atoms/Button/Button';
```

While IDEs like VSCode can auto-complete the path for you, it is still annoying to correct, and read. To solve this, we can use typescript to added aliases for the most common paths. You can now write:

```json tsconfig.json
{
	"compilerOptions": {
		"target": "ESNext",
		"module": "ESNext",
		"moduleResolution": "Bundler",
		"allowSyntheticDefaultImports": true,
		"esModuleInterop": true,
		"jsx": "react-jsx",
		"allowJs": true,
		"checkJs": true,
		"noEmit": true,
		"types": ["vinxi/types/client"],
		"isolatedModules": true,
    "paths": {
      "@/*": ["src/*"],
    }
	}
}

```

Now, you can import Button like this:

```ts
import Button from '@/components/atoms/Button/Button';
```

You can import any module in your directory by its project path starting with @/. 

While this is sufficient for typescript to understand what your are trying to do, you will need to configure your bundler to understand this as well. For vinxi, the best way to do this is to use the `vite-tsconfig-paths` plugin. 

```ts app.config.js
import { createApp } from 'vinxi';
import tsconfigPaths from 'vite-tsconfig-paths';

export default createApp({
  routers: [
    {
      base: "/",
      name: "server",
      mode: "handler",
      plugins: () => [tsconfigPaths()]
    }
  ]
})

```

Now, your aliases will work everywhere in your app. Remember to add the `vite-tsconfig-paths` plugin to all the routers that might need to resolve such imports. By rule of hand, that would be all the routers that are not `mode: "static"`.

```ts vite.config.js