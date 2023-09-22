declare module 'vinxi' {
	import * as v from 'zod';
	export function createApp({ routers, name, server }: AppOptions): App;
	export type RouterSchema = (HandlerRouterSchema | BuildRouterSchema | SPARouterSchema | StaticRouterSchema) & {
		fileRouter?: any;
	};
	export type AppOptions = {
		routers?: RouterSchema[];
		name?: string;
		server?: import('nitropack').NitroConfig;
		root?: string;
	};
	export type App = {
		config: {
			name: string;
			server: import('nitropack').NitroConfig;
			routers: RouterSchema[];
			root: string;
		};
		getRouter: (name: string) => RouterSchema & {
			devServer: import('vite').ViteDevServer;
		};
	};
	export type RouterModes = "static" | "build" | "spa" | "handler";
	export type StaticRouterSchema = v.infer<typeof staticRouterSchema>;
	export type CompiledRouter = {
		getRoutes(): Promise<any[]>;
	};
	export type RouterStyleFn = (router: RouterSchema, app: AppOptions) => CompiledRouter;
	export type BuildRouterSchema = v.infer<typeof buildRouterSchema> & {
		compiled?: CompiledRouter;
	};
	export type HandlerRouterSchema = v.infer<typeof handlerRouterSchema> & {
		compiled?: CompiledRouter;
	};
	export type SPARouterSchema = v.infer<typeof spaRouterSchema> & {
		compiled?: CompiledRouter;
	};
	const staticRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodDefault<v.ZodString>;
		mode: v.ZodLiteral<"static">;
		dir: v.ZodString;
		root: v.ZodOptional<v.ZodString>;
	}, "strip", v.ZodTypeAny, {
		name?: string;
		base?: string;
		mode?: "static";
		dir?: string;
		root?: string;
	}, {
		name?: string;
		base?: string;
		mode?: "static";
		dir?: string;
		root?: string;
	}>;

	const buildRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodDefault<v.ZodString>;
		root: v.ZodOptional<v.ZodString>;
		mode: v.ZodLiteral<"build">;
		handler: v.ZodString;
		
		style: v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>;
		extensions: v.ZodOptional<v.ZodArray<v.ZodString, "many">>;
		compile: v.ZodObject<{
			outDir: v.ZodOptional<v.ZodString>;
			target: v.ZodLiteral<"browser">;
			plugins: v.ZodOptional<v.ZodType<any, v.ZodTypeDef, any>>;
		}, "strip", v.ZodTypeAny, {
			outDir?: string;
			target?: "browser";
			plugins?: any;
		}, {
			outDir?: string;
			target?: "browser";
			plugins?: any;
		}>;
	}, "strip", v.ZodTypeAny, {
		name?: string;
		base?: string;
		root?: string;
		mode?: "build";
		handler?: string;
		style?: RouterStyleFn;
		extensions?: string[];
		compile?: {
			outDir?: string;
			target?: "browser";
			plugins?: any;
		};
	}, {
		name?: string;
		base?: string;
		root?: string;
		mode?: "build";
		handler?: string;
		style?: RouterStyleFn;
		extensions?: string[];
		compile?: {
			outDir?: string;
			target?: "browser";
			plugins?: any;
		};
	}>;



	const handlerRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodDefault<v.ZodString>;
		root: v.ZodOptional<v.ZodString>;
		mode: v.ZodLiteral<"handler">;
		worker: v.ZodOptional<v.ZodBoolean>;
		handler: v.ZodString;
		middleware: v.ZodOptional<v.ZodString>;
		
		style: v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>;
		compile: v.ZodObject<{
			outDir: v.ZodOptional<v.ZodString>;
			target: v.ZodLiteral<"server">;
			plugins: v.ZodOptional<v.ZodType<any, v.ZodTypeDef, any>>;
		}, "strip", v.ZodTypeAny, {
			outDir?: string;
			target?: "server";
			plugins?: any;
		}, {
			outDir?: string;
			target?: "server";
			plugins?: any;
		}>;
	}, "strip", v.ZodTypeAny, {
		name?: string;
		base?: string;
		root?: string;
		mode?: "handler";
		worker?: boolean;
		handler?: string;
		middleware?: string;
		style?: RouterStyleFn;
		compile?: {
			outDir?: string;
			target?: "server";
			plugins?: any;
		};
	}, {
		name?: string;
		base?: string;
		root?: string;
		mode?: "handler";
		worker?: boolean;
		handler?: string;
		middleware?: string;
		style?: RouterStyleFn;
		compile?: {
			outDir?: string;
			target?: "server";
			plugins?: any;
		};
	}>;

	const spaRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodDefault<v.ZodString>;
		root: v.ZodOptional<v.ZodString>;
		mode: v.ZodLiteral<"spa">;
		
		style: v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>;
		handler: v.ZodString;
		compile: v.ZodObject<{
			outDir: v.ZodOptional<v.ZodString>;
			target: v.ZodLiteral<"browser">;
			plugins: v.ZodOptional<v.ZodType<any, v.ZodTypeDef, any>>;
		}, "strip", v.ZodTypeAny, {
			outDir?: string;
			target?: "browser";
			plugins?: any;
		}, {
			outDir?: string;
			target?: "browser";
			plugins?: any;
		}>;
	}, "strip", v.ZodTypeAny, {
		name?: string;
		base?: string;
		root?: string;
		mode?: "spa";
		style?: RouterStyleFn;
		handler?: string;
		compile?: {
			outDir?: string;
			target?: "browser";
			plugins?: any;
		};
	}, {
		name?: string;
		base?: string;
		root?: string;
		mode?: "spa";
		style?: RouterStyleFn;
		handler?: string;
		compile?: {
			outDir?: string;
			target?: "browser";
			plugins?: any;
		};
	}>;
	function relativeAppPath(path: any, router: any, appConfig: any): string;
	export namespace resolve {
		export { relativeAppPath as relative };
		export { absoluteAppPath as absolute };
	}
	function absoluteAppPath(path: any, router: any, appConfig: any): any;
}

declare module 'vinxi/file-system-router' {
	import type { pathToRegexp } from 'path-to-regexp';
	import * as v from 'zod';
	export function cleanPath(src: any, config: any): any;

	export function analyzeModule(src: any): readonly [imports: readonly import("es-module-lexer").ImportSpecifier[], exports: readonly import("es-module-lexer").ExportSpecifier[], facade: boolean];
	export function glob(path: any): string[];
	export class BaseFileSystemRouter {
		
		constructor(config: FileSystemRouterConfig, router: RouterSchema, app: AppOptions);
		routes: any[];
		routerConfig: RouterSchema;
		appConfig: AppOptions;
		config: FileSystemRouterConfig;
		glob(): string;
		
		buildRoutes(): Promise<any[]>;
		
		isRoute(src: any): boolean;
		
		toPath(src: any): string;
		
		toRoute(src: any): object;
		/**
		 * To be attached by vite plugin to the vite dev server
		 */
		update: any;
		_addRoute(route: any): void;
		addRoute(src: any): void;
		updateRoute(src: any): void;
		removeRoute(src: any): void;
		buildRoutesPromise: any;
		getRoutes(): Promise<any[]>;
	}
	export type FileSystemRouterConfig = {
		dir: string;
		extensions?: string[];
	};
	type RouterSchema = (HandlerRouterSchema | BuildRouterSchema | SPARouterSchema | StaticRouterSchema) & {
		fileRouter?: any;
	};
	type AppOptions = {
		routers?: RouterSchema[];
		name?: string;
		server?: import('nitropack').NitroConfig;
		root?: string;
	};
	type StaticRouterSchema = v.infer<typeof staticRouterSchema>;
	type CompiledRouter = {
		getRoutes(): Promise<any[]>;
	};
	type RouterStyleFn = (router: RouterSchema, app: AppOptions) => CompiledRouter;
	type BuildRouterSchema = v.infer<typeof buildRouterSchema> & {
		compiled?: CompiledRouter;
	};
	type HandlerRouterSchema = v.infer<typeof handlerRouterSchema> & {
		compiled?: CompiledRouter;
	};
	type SPARouterSchema = v.infer<typeof spaRouterSchema> & {
		compiled?: CompiledRouter;
	};
	const staticRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodDefault<v.ZodString>;
		mode: v.ZodLiteral<"static">;
		dir: v.ZodString;
		root: v.ZodOptional<v.ZodString>;
	}, "strip", v.ZodTypeAny, {
		name?: string;
		base?: string;
		mode?: "static";
		dir?: string;
		root?: string;
	}, {
		name?: string;
		base?: string;
		mode?: "static";
		dir?: string;
		root?: string;
	}>;

	const buildRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodDefault<v.ZodString>;
		root: v.ZodOptional<v.ZodString>;
		mode: v.ZodLiteral<"build">;
		handler: v.ZodString;
		
		style: v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>;
		extensions: v.ZodOptional<v.ZodArray<v.ZodString, "many">>;
		compile: v.ZodObject<{
			outDir: v.ZodOptional<v.ZodString>;
			target: v.ZodLiteral<"browser">;
			plugins: v.ZodOptional<v.ZodType<any, v.ZodTypeDef, any>>;
		}, "strip", v.ZodTypeAny, {
			outDir?: string;
			target?: "browser";
			plugins?: any;
		}, {
			outDir?: string;
			target?: "browser";
			plugins?: any;
		}>;
	}, "strip", v.ZodTypeAny, {
		name?: string;
		base?: string;
		root?: string;
		mode?: "build";
		handler?: string;
		style?: RouterStyleFn;
		extensions?: string[];
		compile?: {
			outDir?: string;
			target?: "browser";
			plugins?: any;
		};
	}, {
		name?: string;
		base?: string;
		root?: string;
		mode?: "build";
		handler?: string;
		style?: RouterStyleFn;
		extensions?: string[];
		compile?: {
			outDir?: string;
			target?: "browser";
			plugins?: any;
		};
	}>;



	const handlerRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodDefault<v.ZodString>;
		root: v.ZodOptional<v.ZodString>;
		mode: v.ZodLiteral<"handler">;
		worker: v.ZodOptional<v.ZodBoolean>;
		handler: v.ZodString;
		middleware: v.ZodOptional<v.ZodString>;
		
		style: v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>;
		compile: v.ZodObject<{
			outDir: v.ZodOptional<v.ZodString>;
			target: v.ZodLiteral<"server">;
			plugins: v.ZodOptional<v.ZodType<any, v.ZodTypeDef, any>>;
		}, "strip", v.ZodTypeAny, {
			outDir?: string;
			target?: "server";
			plugins?: any;
		}, {
			outDir?: string;
			target?: "server";
			plugins?: any;
		}>;
	}, "strip", v.ZodTypeAny, {
		name?: string;
		base?: string;
		root?: string;
		mode?: "handler";
		worker?: boolean;
		handler?: string;
		middleware?: string;
		style?: RouterStyleFn;
		compile?: {
			outDir?: string;
			target?: "server";
			plugins?: any;
		};
	}, {
		name?: string;
		base?: string;
		root?: string;
		mode?: "handler";
		worker?: boolean;
		handler?: string;
		middleware?: string;
		style?: RouterStyleFn;
		compile?: {
			outDir?: string;
			target?: "server";
			plugins?: any;
		};
	}>;

	const spaRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodDefault<v.ZodString>;
		root: v.ZodOptional<v.ZodString>;
		mode: v.ZodLiteral<"spa">;
		
		style: v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>;
		handler: v.ZodString;
		compile: v.ZodObject<{
			outDir: v.ZodOptional<v.ZodString>;
			target: v.ZodLiteral<"browser">;
			plugins: v.ZodOptional<v.ZodType<any, v.ZodTypeDef, any>>;
		}, "strip", v.ZodTypeAny, {
			outDir?: string;
			target?: "browser";
			plugins?: any;
		}, {
			outDir?: string;
			target?: "browser";
			plugins?: any;
		}>;
	}, "strip", v.ZodTypeAny, {
		name?: string;
		base?: string;
		root?: string;
		mode?: "spa";
		style?: RouterStyleFn;
		handler?: string;
		compile?: {
			outDir?: string;
			target?: "browser";
			plugins?: any;
		};
	}, {
		name?: string;
		base?: string;
		root?: string;
		mode?: "spa";
		style?: RouterStyleFn;
		handler?: string;
		compile?: {
			outDir?: string;
			target?: "browser";
			plugins?: any;
		};
	}>;
	export { pathToRegexp };
}

declare module 'vinxi/routes' {
	export const routes: {
		path: string;
	}[];
}

declare module 'vinxi/runtime/client' {
}

declare module 'vinxi/runtime/server' {
	export * from "h3";
	export function setContext(event: any, key: any, value: any): void;
	export function getContext(event: any, key: any, value: any): any;
	export function defineMiddleware(options: any): any;
}

declare module 'vinxi/runtime/style' {
	export function updateStyles(styles: any, data: any): void;
	export function appendStyles(styles: any): void;
	export function cleanupStyles(styles: any): void;
}

declare module 'vinxi/plugins/config' {
	import type { ConfigEnv, UserConfig, Plugin as VitePlugin } from 'vite';
	export function config(tag: string, conf: import('vite').InlineConfig): Plugin;
	interface Plugin extends VitePlugin {
		config?: (
			this: void,
			config: UserConfig & { router: any },
			env: ConfigEnv,
		) => void | UserConfig | Promise<void | UserConfig>;
	}
}

declare module 'vinxi/plugins/virtual' {
	import type { ConfigEnv, UserConfig, Plugin as VitePlugin } from 'vite';
	export function virtual(modules: {
		[key: string]: any;
	}, name?: string, cache?: any): Plugin;
	interface Plugin extends VitePlugin {
		config?: (
			this: void,
			config: UserConfig & { router: any },
			env: ConfigEnv,
		) => void | UserConfig | Promise<void | UserConfig>;
	}
}

//# sourceMappingURL=index.d.ts.map