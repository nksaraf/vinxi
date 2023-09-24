declare module 'vinxi' {
	import type { EventHandler } from 'h3';
	import type { Plugin as VitePlugin } from 'vite';
	import * as v from 'zod';
	export { ConfigEnv as  } from 'vite';
	export function createApp({ routers, name, server, root, }: AppOptions): App;
	export type AppOptions = {
		routers?: RouterSchemaInput[];
		name?: string;
		server?: import('nitropack').NitroConfig;
		root?: string;
	};
	export type App = {
		config: {
			name: string;
			server: import('nitropack').NitroConfig;
			routers: Router<any>[];
			root: string;
		};
		getRouter: (name: string) => RouterSchema;
		dev(): Promise<void>;
		build(): Promise<void>;
	};
	export function createRouterMode<X, T>(schema: X, mode: RouterMode<v.TypeOf<X>>): RouterMode<v.TypeOf<X>>;

	export function resolveRouterConfig(router: RouterSchemaInput, appConfig: AppOptions, order: number): RouterSchema;

	export const staticRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodOptional<v.ZodDefault<v.ZodString>>;
		mode: v.ZodLiteral<"static">;
		dir: v.ZodString;
		root: v.ZodOptional<v.ZodString>;
	}, "strip", v.ZodTypeAny, {
		name: string;
		dir: string;
		mode: "static";
		base?: string | undefined;
		root?: string | undefined;
	}, {
		name: string;
		dir: string;
		mode: "static";
		base?: string | undefined;
		root?: string | undefined;
	}>;
	export const buildRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodOptional<v.ZodDefault<v.ZodString>>;
		root: v.ZodOptional<v.ZodString>;
		mode: v.ZodLiteral<"build">;
		handler: v.ZodString;
		
		routes: v.ZodOptionalType<v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>>;
		extensions: v.ZodOptional<v.ZodArray<v.ZodString, "many">>;
		outDir: v.ZodOptional<v.ZodString>;
		target: v.ZodLiteral<"browser">;
		plugins: v.ZodOptional<v.ZodType<any, v.ZodTypeDef, any>>;
	}, "strip", v.ZodTypeAny, {
		name: string;
		target: "browser";
		mode: "build";
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		routes?: RouterStyleFn | undefined;
		extensions?: string[] | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}, {
		name: string;
		target: "browser";
		mode: "build";
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		routes?: RouterStyleFn | undefined;
		extensions?: string[] | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}>;
	export const handlerRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodOptional<v.ZodDefault<v.ZodString>>;
		root: v.ZodOptional<v.ZodString>;
		mode: v.ZodLiteral<"handler">;
		worker: v.ZodOptional<v.ZodBoolean>;
		handler: v.ZodString;
		middleware: v.ZodOptional<v.ZodString>;
		
		routes: v.ZodOptionalType<v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>>;
		outDir: v.ZodOptional<v.ZodString>;
		target: v.ZodLiteral<"server">;
		plugins: v.ZodOptional<v.ZodType<any, v.ZodTypeDef, any>>;
	}, "strip", v.ZodTypeAny, {
		name: string;
		target: "server";
		mode: "handler";
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		worker?: boolean | undefined;
		middleware?: string | undefined;
		routes?: RouterStyleFn | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}, {
		name: string;
		target: "server";
		mode: "handler";
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		worker?: boolean | undefined;
		middleware?: string | undefined;
		routes?: RouterStyleFn | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}>;
	export const spaRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodOptional<v.ZodDefault<v.ZodString>>;
		root: v.ZodOptional<v.ZodString>;
		mode: v.ZodLiteral<"spa">;
		
		routes: v.ZodOptionalType<v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>>;
		handler: v.ZodString;
		outDir: v.ZodOptional<v.ZodString>;
		target: v.ZodLiteral<"browser">;
		plugins: v.ZodOptional<v.ZodType<any, v.ZodTypeDef, any>>;
	}, "strip", v.ZodTypeAny, {
		name: string;
		target: "browser";
		mode: "spa";
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		routes?: RouterStyleFn | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}, {
		name: string;
		target: "browser";
		mode: "spa";
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		routes?: RouterStyleFn | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}>;
	export namespace routerSchema {
		export { staticRouterSchema as static };
		export { buildRouterSchema as build };
		export { spaRouterSchema as spa };
		export { handlerRouterSchema as handler };
		export { customRouterSchema as custom };
	}
	export type BuildRouterSchema = v.infer<typeof buildRouterSchema> & {
		outDir: string;
		base: string;
		order: number;
		root: string;
		internals: Internals;
	};
	export type CustomRouterSchema = v.infer<typeof customRouterSchema> & {
		outDir: string;
		base: string;
		order: number;
		root: string;
		internals: Internals;
	};
	export type StaticRouterSchema = v.infer<typeof staticRouterSchema> & {
		outDir: string;
		base: string;
		order: number;
		internals: Internals;
	};
	export type HandlerRouterSchema = v.infer<typeof handlerRouterSchema> & {
		outDir: string;
		base: string;
		order: number;
		root: string;
		internals: Internals;
	};
	export type SPARouterSchema = v.infer<typeof spaRouterSchema> & {
		outDir: string;
		base: string;
		order: number;
		root: string;
		internals: Internals;
	};
	export type RouterSchema = (HandlerRouterSchema | BuildRouterSchema | SPARouterSchema | StaticRouterSchema | CustomRouterSchema);
	export type RouterSchemaInput = (v.infer<typeof buildRouterSchema> | v.infer<typeof staticRouterSchema> | v.infer<typeof spaRouterSchema> | v.infer<typeof handlerRouterSchema> | v.infer<typeof customRouterSchema>);
	export type Internals = {
		routes?: CompiledRouter;
		devServer?: import('vite').ViteDevServer;
		appWorker?: AppWorkerClient;
		mode: RouterMode;
	};
	export type CompiledRouter = {
		getRoutes(): Promise<any[]>;
	} & EventTarget;
	export type RouterStyleFn = (router: RouterSchemaInput, app: AppOptions) => CompiledRouter;
	const customRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodOptional<v.ZodDefault<v.ZodString>>;
		root: v.ZodOptional<v.ZodString>;
		mode: v.ZodObject<{
			resolveConfig: v.ZodFunction<v.ZodTuple<[v.ZodAny, v.ZodAny], v.ZodUnknown>, v.ZodAny>;
		}, "strip", v.ZodTypeAny, {
			resolveConfig: (args_0: any, args_1: any, ...args_2: unknown[]) => any;
		}, {
			resolveConfig: (args_0: any, args_1: any, ...args_2: unknown[]) => any;
		}>;
		
		routes: v.ZodOptionalType<v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>>;
		handler: v.ZodString;
		outDir: v.ZodOptional<v.ZodString>;
		target: v.ZodLiteral<"server">;
		plugins: v.ZodOptional<v.ZodType<any, v.ZodTypeDef, any>>;
	}, "strip", v.ZodTypeAny, {
		name: string;
		target: "server";
		mode: {
			resolveConfig: (args_0: any, args_1: any, ...args_2: unknown[]) => any;
		};
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		routes?: RouterStyleFn | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}, {
		name: string;
		target: "server";
		mode: {
			resolveConfig: (args_0: any, args_1: any, ...args_2: unknown[]) => any;
		};
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		routes?: RouterStyleFn | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}>;
	function relativeAppPath<T extends string | undefined>(path: T, root: string): T;
	export namespace resolve {
		export { relativeAppPath as relative };
		export { absoluteAppPath as absolute };
	}

	function absoluteAppPath<T extends string | undefined>(path: T, root: string): T;
	type PublicAsset = {
		baseURL?: string | undefined;
		fallthrough?: boolean | undefined;
		maxAge?: number | undefined;
		dir?: string | undefined;
	};

	type DevHandler = {
		route: string;
		handler: EventHandler<any, any>;
	};

	type Router<T> = T & {
		base: string;
		internals: Internals;
		order: number;
		outDir: string;
		root: string;
	};

	type RouterMode<T extends any = any> = {
		name: string;
		dev: {
			publicAssets?: (
				router: Router<T>,
				app: App,
			) => PublicAsset | PublicAsset[] | undefined | void;
			plugins?: (
				router: Router<T>,
				app: App,
			) => Promise<(Plugin | null)[]> | undefined | void;
			handler?: (
				router: Router<T>,
				app: App,
				serveConfig: ServeConfig,
			) =>
				| Promise<DevHandler | DevHandler[]>
				| DevHandler
				| DevHandler[]
				| undefined
				| void;
		};
		resolveConfig: (
			router: T,
			appConfig: AppOptions,
			order?: number,
		) => T;
	};
  class AppWorkerClient {
	  
	  constructor(url: URL);
	  
	  worker: import('node:worker_threads').Worker | null;
	  
	  responses: Map<string, (event: any) => void>;
	  url: URL;
	  /**
	 *
	//  * @param {() => void} onReload
	 */
	  init(onReload: any): Promise<void>;
	  
	  handle(event: import('h3').H3Event): null;
	  close(): void;
  }
	type ServeConfig = {
		port: number;
		dev: boolean;
		ws: {
			port: number;
		};
	};
	type Plugin = VitePlugin;
}

declare module 'vinxi/dev-server' {
	import type { Plugin as VitePlugin } from 'vite';
	import type { EventHandler } from 'h3';
	import * as v from 'zod';
	export { ConfigEnv as  } from 'vite';
	export function devEntries(): Plugin;

	export function createViteServer(config: import('vite').InlineConfig & {
		router: Router<any>;
		app: App;
	}): Promise<import("vite").ViteDevServer>;

	export function createViteHandler(router: Router<{
		plugins?: any;
	}>, app: App, serveConfig: ServeConfig): Promise<import("vite").ViteDevServer>;

	export function createDevServer(app: App, { port, dev, ws: { port: wsPort } }: ServeConfigInput): Promise<{
		listen: (port: number, opts: Partial<import("listhen/dist/shared/listhen.10ba2b37.js").L>) => Promise<import("listhen/dist/shared/listhen.10ba2b37.js").a>;
		h3App: import("h3").App;
		localCall: (context: import("unenv/runtime/fetch/call.js").CallContext) => Promise<{
			body: BodyInit | null;
			headers: Record<string, string | number | string[] | undefined>;
			status: number;
			statusText: string;
		}>;
		localFetch: (input: string | Request, init: import("unenv/runtime/fetch/index.js").FetchOptions) => Promise<Response>;
		close: () => Promise<void>;
	} | undefined>;
	export type ServeConfigInput = {
		port?: number;
		dev?: boolean;
		ws?: {
			port?: number;
		};
	};
	export type ServeConfig = {
		port: number;
		dev: boolean;
		ws: {
			port: number;
		};
	};
	type Plugin = VitePlugin;
	type PublicAsset = {
		baseURL?: string | undefined;
		fallthrough?: boolean | undefined;
		maxAge?: number | undefined;
		dir?: string | undefined;
	};

	type DevHandler = {
		route: string;
		handler: EventHandler<any, any>;
	};

	type Router<T> = T & {
		base: string;
		internals: Internals;
		order: number;
		outDir: string;
		root: string;
	};

	type RouterMode<T extends any = any> = {
		name: string;
		dev: {
			publicAssets?: (
				router: Router<T>,
				app: App,
			) => PublicAsset | PublicAsset[] | undefined | void;
			plugins?: (
				router: Router<T>,
				app: App,
			) => Promise<(Plugin | null)[]> | undefined | void;
			handler?: (
				router: Router<T>,
				app: App,
				serveConfig: ServeConfig,
			) =>
				| Promise<DevHandler | DevHandler[]>
				| DevHandler
				| DevHandler[]
				| undefined
				| void;
		};
		resolveConfig: (
			router: T,
			appConfig: AppOptions,
			order?: number,
		) => T;
	};
	type AppOptions = {
		routers?: RouterSchemaInput[];
		name?: string;
		server?: import('nitropack').NitroConfig;
		root?: string;
	};
	type App = {
		config: {
			name: string;
			server: import('nitropack').NitroConfig;
			routers: Router<any>[];
			root: string;
		};
		getRouter: (name: string) => RouterSchema;
		dev(): Promise<void>;
		build(): Promise<void>;
	};
	export namespace ROUTER_MODE_DEV_PLUGINS {
		function spa(router: SPARouterSchema): (import("vite").Plugin | null)[];
		function handler(router: HandlerRouterSchema): (import("vite").Plugin | null)[];
		function build(router: BuildRouterSchema): (import("vite").Plugin | null)[];
	}
	const staticRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodOptional<v.ZodDefault<v.ZodString>>;
		mode: v.ZodLiteral<"static">;
		dir: v.ZodString;
		root: v.ZodOptional<v.ZodString>;
	}, "strip", v.ZodTypeAny, {
		name: string;
		dir: string;
		mode: "static";
		base?: string | undefined;
		root?: string | undefined;
	}, {
		name: string;
		dir: string;
		mode: "static";
		base?: string | undefined;
		root?: string | undefined;
	}>;
	const buildRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodOptional<v.ZodDefault<v.ZodString>>;
		root: v.ZodOptional<v.ZodString>;
		mode: v.ZodLiteral<"build">;
		handler: v.ZodString;
		
		routes: v.ZodOptionalType<v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>>;
		extensions: v.ZodOptional<v.ZodArray<v.ZodString, "many">>;
		outDir: v.ZodOptional<v.ZodString>;
		target: v.ZodLiteral<"browser">;
		plugins: v.ZodOptional<v.ZodType<any, v.ZodTypeDef, any>>;
	}, "strip", v.ZodTypeAny, {
		name: string;
		target: "browser";
		mode: "build";
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		routes?: RouterStyleFn | undefined;
		extensions?: string[] | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}, {
		name: string;
		target: "browser";
		mode: "build";
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		routes?: RouterStyleFn | undefined;
		extensions?: string[] | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}>;
	const handlerRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodOptional<v.ZodDefault<v.ZodString>>;
		root: v.ZodOptional<v.ZodString>;
		mode: v.ZodLiteral<"handler">;
		worker: v.ZodOptional<v.ZodBoolean>;
		handler: v.ZodString;
		middleware: v.ZodOptional<v.ZodString>;
		
		routes: v.ZodOptionalType<v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>>;
		outDir: v.ZodOptional<v.ZodString>;
		target: v.ZodLiteral<"server">;
		plugins: v.ZodOptional<v.ZodType<any, v.ZodTypeDef, any>>;
	}, "strip", v.ZodTypeAny, {
		name: string;
		target: "server";
		mode: "handler";
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		worker?: boolean | undefined;
		middleware?: string | undefined;
		routes?: RouterStyleFn | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}, {
		name: string;
		target: "server";
		mode: "handler";
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		worker?: boolean | undefined;
		middleware?: string | undefined;
		routes?: RouterStyleFn | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}>;
	const spaRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodOptional<v.ZodDefault<v.ZodString>>;
		root: v.ZodOptional<v.ZodString>;
		mode: v.ZodLiteral<"spa">;
		
		routes: v.ZodOptionalType<v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>>;
		handler: v.ZodString;
		outDir: v.ZodOptional<v.ZodString>;
		target: v.ZodLiteral<"browser">;
		plugins: v.ZodOptional<v.ZodType<any, v.ZodTypeDef, any>>;
	}, "strip", v.ZodTypeAny, {
		name: string;
		target: "browser";
		mode: "spa";
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		routes?: RouterStyleFn | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}, {
		name: string;
		target: "browser";
		mode: "spa";
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		routes?: RouterStyleFn | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}>;
	type BuildRouterSchema = v.infer<typeof buildRouterSchema> & {
		outDir: string;
		base: string;
		order: number;
		root: string;
		internals: Internals;
	};
	type CustomRouterSchema = v.infer<typeof customRouterSchema> & {
		outDir: string;
		base: string;
		order: number;
		root: string;
		internals: Internals;
	};
	type StaticRouterSchema = v.infer<typeof staticRouterSchema> & {
		outDir: string;
		base: string;
		order: number;
		internals: Internals;
	};
	type HandlerRouterSchema = v.infer<typeof handlerRouterSchema> & {
		outDir: string;
		base: string;
		order: number;
		root: string;
		internals: Internals;
	};
	type SPARouterSchema = v.infer<typeof spaRouterSchema> & {
		outDir: string;
		base: string;
		order: number;
		root: string;
		internals: Internals;
	};
	type RouterSchema = (HandlerRouterSchema | BuildRouterSchema | SPARouterSchema | StaticRouterSchema | CustomRouterSchema);
	type RouterSchemaInput = (v.infer<typeof buildRouterSchema> | v.infer<typeof staticRouterSchema> | v.infer<typeof spaRouterSchema> | v.infer<typeof handlerRouterSchema> | v.infer<typeof customRouterSchema>);
	type Internals = {
		routes?: CompiledRouter;
		devServer?: import('vite').ViteDevServer;
		appWorker?: AppWorkerClient;
		mode: RouterMode;
	};
	type CompiledRouter = {
		getRoutes(): Promise<any[]>;
	} & EventTarget;
	type RouterStyleFn = (router: RouterSchemaInput, app: AppOptions) => CompiledRouter;
	const customRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodOptional<v.ZodDefault<v.ZodString>>;
		root: v.ZodOptional<v.ZodString>;
		mode: v.ZodObject<{
			resolveConfig: v.ZodFunction<v.ZodTuple<[v.ZodAny, v.ZodAny], v.ZodUnknown>, v.ZodAny>;
		}, "strip", v.ZodTypeAny, {
			resolveConfig: (args_0: any, args_1: any, ...args_2: unknown[]) => any;
		}, {
			resolveConfig: (args_0: any, args_1: any, ...args_2: unknown[]) => any;
		}>;
		
		routes: v.ZodOptionalType<v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>>;
		handler: v.ZodString;
		outDir: v.ZodOptional<v.ZodString>;
		target: v.ZodLiteral<"server">;
		plugins: v.ZodOptional<v.ZodType<any, v.ZodTypeDef, any>>;
	}, "strip", v.ZodTypeAny, {
		name: string;
		target: "server";
		mode: {
			resolveConfig: (args_0: any, args_1: any, ...args_2: unknown[]) => any;
		};
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		routes?: RouterStyleFn | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}, {
		name: string;
		target: "server";
		mode: {
			resolveConfig: (args_0: any, args_1: any, ...args_2: unknown[]) => any;
		};
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		routes?: RouterStyleFn | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}>;
  class AppWorkerClient {
	  
	  constructor(url: URL);
	  
	  worker: import('node:worker_threads').Worker | null;
	  
	  responses: Map<string, (event: any) => void>;
	  url: URL;
	  /**
	 *
	//  * @param {() => void} onReload
	 */
	  init(onReload: any): Promise<void>;
	  
	  handle(event: import('h3').H3Event): null;
	  close(): void;
  }
}

declare module 'vinxi/file-system-router' {
	import type { pathToRegexp } from 'path-to-regexp';
	import type { EventHandler } from 'h3';
	import type { Plugin as VitePlugin } from 'vite';
	import * as v from 'zod';
	export { ConfigEnv as  } from 'vite';
	export function cleanPath(src: string, config: FileSystemRouterConfig): string;

	export function analyzeModule(src: string): readonly [imports: readonly import("es-module-lexer").ImportSpecifier[], exports: readonly import("es-module-lexer").ExportSpecifier[], facade: boolean];
	export function glob(path: string): string[];
	export class BaseFileSystemRouter extends EventTarget {
		
		constructor(config: FileSystemRouterConfig, router: Router<any>, app: AppOptions);
		
		routes: any[];
		
		routerConfig: Router<any>;
		
		appConfig: AppOptions;
		
		config: FileSystemRouterConfig;
		glob(): string;
		
		buildRoutes(): Promise<any[]>;
		
		isRoute(src: any): boolean;
		
		toPath(src: any): string;
		
		toRoute(src: any): Route | null;
		/**
		 * To be attached by vite plugin to the vite dev server
		 */
		update: undefined;
		
		_addRoute(route: Route): void;
		
		addRoute(src: string): void;
		
		updateRoute(src: string): void;
		
		removeRoute(src: string): void;
		
		buildRoutesPromise: Promise<any[]> | undefined;
		getRoutes(): Promise<any[]>;
	}
	export type FileSystemRouterConfig = {
		dir: string;
		extensions: string[];
	};
	export type Route = {
		path: string;
	} & any;
	type PublicAsset = {
		baseURL?: string | undefined;
		fallthrough?: boolean | undefined;
		maxAge?: number | undefined;
		dir?: string | undefined;
	};

	type DevHandler = {
		route: string;
		handler: EventHandler<any, any>;
	};

	type Router<T> = T & {
		base: string;
		internals: Internals;
		order: number;
		outDir: string;
		root: string;
	};

	type RouterMode<T extends any = any> = {
		name: string;
		dev: {
			publicAssets?: (
				router: Router<T>,
				app: App,
			) => PublicAsset | PublicAsset[] | undefined | void;
			plugins?: (
				router: Router<T>,
				app: App,
			) => Promise<(Plugin | null)[]> | undefined | void;
			handler?: (
				router: Router<T>,
				app: App,
				serveConfig: ServeConfig,
			) =>
				| Promise<DevHandler | DevHandler[]>
				| DevHandler
				| DevHandler[]
				| undefined
				| void;
		};
		resolveConfig: (
			router: T,
			appConfig: AppOptions,
			order?: number,
		) => T;
	};
	type AppOptions = {
		routers?: RouterSchemaInput[];
		name?: string;
		server?: import('nitropack').NitroConfig;
		root?: string;
	};
	type App = {
		config: {
			name: string;
			server: import('nitropack').NitroConfig;
			routers: Router<any>[];
			root: string;
		};
		getRouter: (name: string) => RouterSchema;
		dev(): Promise<void>;
		build(): Promise<void>;
	};
	const staticRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodOptional<v.ZodDefault<v.ZodString>>;
		mode: v.ZodLiteral<"static">;
		dir: v.ZodString;
		root: v.ZodOptional<v.ZodString>;
	}, "strip", v.ZodTypeAny, {
		name: string;
		dir: string;
		mode: "static";
		base?: string | undefined;
		root?: string | undefined;
	}, {
		name: string;
		dir: string;
		mode: "static";
		base?: string | undefined;
		root?: string | undefined;
	}>;
	const buildRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodOptional<v.ZodDefault<v.ZodString>>;
		root: v.ZodOptional<v.ZodString>;
		mode: v.ZodLiteral<"build">;
		handler: v.ZodString;
		
		routes: v.ZodOptionalType<v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>>;
		extensions: v.ZodOptional<v.ZodArray<v.ZodString, "many">>;
		outDir: v.ZodOptional<v.ZodString>;
		target: v.ZodLiteral<"browser">;
		plugins: v.ZodOptional<v.ZodType<any, v.ZodTypeDef, any>>;
	}, "strip", v.ZodTypeAny, {
		name: string;
		target: "browser";
		mode: "build";
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		routes?: RouterStyleFn | undefined;
		extensions?: string[] | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}, {
		name: string;
		target: "browser";
		mode: "build";
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		routes?: RouterStyleFn | undefined;
		extensions?: string[] | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}>;
	const handlerRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodOptional<v.ZodDefault<v.ZodString>>;
		root: v.ZodOptional<v.ZodString>;
		mode: v.ZodLiteral<"handler">;
		worker: v.ZodOptional<v.ZodBoolean>;
		handler: v.ZodString;
		middleware: v.ZodOptional<v.ZodString>;
		
		routes: v.ZodOptionalType<v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>>;
		outDir: v.ZodOptional<v.ZodString>;
		target: v.ZodLiteral<"server">;
		plugins: v.ZodOptional<v.ZodType<any, v.ZodTypeDef, any>>;
	}, "strip", v.ZodTypeAny, {
		name: string;
		target: "server";
		mode: "handler";
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		worker?: boolean | undefined;
		middleware?: string | undefined;
		routes?: RouterStyleFn | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}, {
		name: string;
		target: "server";
		mode: "handler";
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		worker?: boolean | undefined;
		middleware?: string | undefined;
		routes?: RouterStyleFn | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}>;
	const spaRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodOptional<v.ZodDefault<v.ZodString>>;
		root: v.ZodOptional<v.ZodString>;
		mode: v.ZodLiteral<"spa">;
		
		routes: v.ZodOptionalType<v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>>;
		handler: v.ZodString;
		outDir: v.ZodOptional<v.ZodString>;
		target: v.ZodLiteral<"browser">;
		plugins: v.ZodOptional<v.ZodType<any, v.ZodTypeDef, any>>;
	}, "strip", v.ZodTypeAny, {
		name: string;
		target: "browser";
		mode: "spa";
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		routes?: RouterStyleFn | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}, {
		name: string;
		target: "browser";
		mode: "spa";
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		routes?: RouterStyleFn | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}>;
	type BuildRouterSchema = v.infer<typeof buildRouterSchema> & {
		outDir: string;
		base: string;
		order: number;
		root: string;
		internals: Internals;
	};
	type CustomRouterSchema = v.infer<typeof customRouterSchema> & {
		outDir: string;
		base: string;
		order: number;
		root: string;
		internals: Internals;
	};
	type StaticRouterSchema = v.infer<typeof staticRouterSchema> & {
		outDir: string;
		base: string;
		order: number;
		internals: Internals;
	};
	type HandlerRouterSchema = v.infer<typeof handlerRouterSchema> & {
		outDir: string;
		base: string;
		order: number;
		root: string;
		internals: Internals;
	};
	type SPARouterSchema = v.infer<typeof spaRouterSchema> & {
		outDir: string;
		base: string;
		order: number;
		root: string;
		internals: Internals;
	};
	type RouterSchema = (HandlerRouterSchema | BuildRouterSchema | SPARouterSchema | StaticRouterSchema | CustomRouterSchema);
	type RouterSchemaInput = (v.infer<typeof buildRouterSchema> | v.infer<typeof staticRouterSchema> | v.infer<typeof spaRouterSchema> | v.infer<typeof handlerRouterSchema> | v.infer<typeof customRouterSchema>);
	type Internals = {
		routes?: CompiledRouter;
		devServer?: import('vite').ViteDevServer;
		appWorker?: AppWorkerClient;
		mode: RouterMode;
	};
	type CompiledRouter = {
		getRoutes(): Promise<any[]>;
	} & EventTarget;
	type RouterStyleFn = (router: RouterSchemaInput, app: AppOptions) => CompiledRouter;
	const customRouterSchema: v.ZodObject<{
		name: v.ZodString;
		base: v.ZodOptional<v.ZodDefault<v.ZodString>>;
		root: v.ZodOptional<v.ZodString>;
		mode: v.ZodObject<{
			resolveConfig: v.ZodFunction<v.ZodTuple<[v.ZodAny, v.ZodAny], v.ZodUnknown>, v.ZodAny>;
		}, "strip", v.ZodTypeAny, {
			resolveConfig: (args_0: any, args_1: any, ...args_2: unknown[]) => any;
		}, {
			resolveConfig: (args_0: any, args_1: any, ...args_2: unknown[]) => any;
		}>;
		
		routes: v.ZodOptionalType<v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>>;
		handler: v.ZodString;
		outDir: v.ZodOptional<v.ZodString>;
		target: v.ZodLiteral<"server">;
		plugins: v.ZodOptional<v.ZodType<any, v.ZodTypeDef, any>>;
	}, "strip", v.ZodTypeAny, {
		name: string;
		target: "server";
		mode: {
			resolveConfig: (args_0: any, args_1: any, ...args_2: unknown[]) => any;
		};
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		routes?: RouterStyleFn | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}, {
		name: string;
		target: "server";
		mode: {
			resolveConfig: (args_0: any, args_1: any, ...args_2: unknown[]) => any;
		};
		handler: string;
		base?: string | undefined;
		root?: string | undefined;
		routes?: RouterStyleFn | undefined;
		outDir?: string | undefined;
		plugins?: any;
	}>;
	type ServeConfig = {
		port: number;
		dev: boolean;
		ws: {
			port: number;
		};
	};
	type Plugin = VitePlugin;
  class AppWorkerClient {
	  
	  constructor(url: URL);
	  
	  worker: import('node:worker_threads').Worker | null;
	  
	  responses: Map<string, (event: any) => void>;
	  url: URL;
	  /**
	 *
	//  * @param {() => void} onReload
	 */
	  init(onReload: any): Promise<void>;
	  
	  handle(event: import('h3').H3Event): null;
	  close(): void;
  }
	export { pathToRegexp };
}

declare module 'vinxi/routes' {
	const _default: {
		path: string;
	}[];
	export default _default;
}

declare module 'vinxi/runtime/client' {
}

declare module 'vinxi/runtime/server' {
export * from "h3"
	import type { H3Event } from 'h3';
	export function setContext(event: H3Event, key: string, value: any): void;

	export function getContext(event: H3Event, key: string): any;

	export function defineMiddleware(options: {
		onRequest?: import("h3")._RequestMiddleware | import("h3")._RequestMiddleware[];
		onBeforeResponse?: import("h3")._ResponseMiddleware | import("h3")._ResponseMiddleware[];
	}): {
		onRequest?: import("h3")._RequestMiddleware<import("h3").EventHandlerRequest> | import("h3")._RequestMiddleware<import("h3").EventHandlerRequest>[] | undefined;
		onBeforeResponse?: import("h3")._ResponseMiddleware<import("h3").EventHandlerRequest, any> | import("h3")._ResponseMiddleware<import("h3").EventHandlerRequest, any>[] | undefined;
	};
}

declare module 'vinxi/runtime/style' {
	export function updateStyles(styles: any, data: any): void;
	export function appendStyles(styles: any): void;
	export function cleanupStyles(styles: any): void;
}

declare module 'vinxi/lib/invariant' {
	export default function invariant(condition: any, message: string | number): asserts condition;
	export class InvariantError extends Error {
		constructor(message?: string | number);
		framesToPop: number;
	}
}

declare module 'vinxi/plugins/config' {
	import type { Plugin as VitePlugin } from 'vite';
	import * as v from 'zod';
	export { ConfigEnv as  } from 'vite';
	export function config(tag: string, conf: Omit<import('vite').InlineConfig, 'router'>): Plugin;
	type Plugin = VitePlugin;
}

declare module 'vinxi/plugins/virtual' {
	import type { Plugin as VitePlugin, ResolvedConfig as _ResolvedConfig } from 'vite';
	import * as v from 'zod';
	export { ConfigEnv as  } from 'vite';
	export function virtual(modules: {
		[key: string]: (ctx: {
			config: ViteConfig;
		}) => (string | Promise<string>);
	}, name?: string, cache?: any): Plugin;
	type ViteConfig = _ResolvedConfig & { router: Router<any> };

	type Plugin = VitePlugin;
}

//# sourceMappingURL=index.d.ts.map