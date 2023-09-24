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

declare module 'vinxi/runtime/party' {
	export type StaticAssetsManifestType = {
		devServer: string;
		browserTTL: number | undefined;
		edgeTTL: number | undefined;
		singlePageApp: boolean | undefined;
		assets: Record<string, string>;
	};

	type StandardRequest = globalThis.Request;

	// Types with PartyKit* prefix are used in module workers, i.e.
	// `export default {} satisfies PartyKitServer;`

	// Types with Party.* prefix are used in class workers, i.e.
	// `export default class Room implements Party.Server {}`

	// Extend type so that when language server (e.g. vscode) autocompletes,
	// it will import this type instead of the underlying type directly.
	// export interface Request extends CFRequest {}

	// Because when you construct a `new Request()` in a user script,
	// it's assumed to be a standards-based Fetch API Response, unless overridden.
	// This is fine by us, let user return whichever request type
	type ReturnRequest = StandardRequest;

	/** Per-party key-value storage */
	// export interface Storage extends DurableObjectStorage {}

	/** Connection metadata only available when the connection is made */
	export type ConnectionContext = { request: ReturnRequest };

	export type Stub = {
		connect: () => WebSocket;
		fetch: (init?: RequestInit) => Promise<Response>;
	};

	/** Additional information about other resources in the current project */
	export type Context = {
		/** Access other parties in this project */
		parties: Record<
			string,
			{
				get(id: string): Stub;
			}
		>;
	};

	export type FetchLobby = {
		env: Record<string, unknown>;
		parties: Context["parties"];
	};

	export type Lobby = {
		id: string;
		env: Record<string, unknown>;
		parties: Context["parties"];
	};

	export type ExecutionContext = {};

	/** A WebSocket connected to the Party */
	export type Connection = WebSocket & {
		/** Connection identifier */
		id: string;

		/** @deprecated You can access the socket properties directly on the connection*/
		socket: WebSocket;
		// We would have been able to use Websocket::url
		// but it's not available in the Workers runtime
		// (rather, url is `null` when using WebSocketPair)
		// It's also set as readonly, so we can't set it ourselves.
		// Instead, we'll use the `uri` property.
		uri: string;
	};

	/** Party represents a single, self-contained, long-lived session. */
	export type Party = {
		/** Party ID defined in the Party URL, e.g. /parties/:name/:id */
		id: string;

		/** Internal ID assigned by the platform. Use Party.id instead. */
		internalID: string;

		/** Party name defined in the Party URL, e.g. /parties/:name/:id */
		name: string;

		/** Environment variables (--var, partykit.json#vars, or .env) */
		env: Record<string, unknown>;

		/** A per-party key-value storage */
		storage: Storage;

		/** Additional information about other resources in the current project */
		context: Context;

		/** @deprecated Use `party.getConnections` instead */
		connections: Map<string, Connection>;

		/** @deprecated Use `party.context.parties` instead */
		parties: Context["parties"];

		/** Send a message to all connected clients, except connection ids listed `without` */
		broadcast: (msg: string, without?: string[] | undefined) => void;

		/** Get a connection by connection id */
		getConnection(id: string): Connection | undefined;

		/**
		 * Get all connections. Optionally, you can provide a tag to filter returned connections.
		 * Use `Party.Server#getConnectionTags` to tag the connection on connect.
		 */
		getConnections(tag?: string): Iterable<Connection>;
	};

	/* Party.Server defines what happens when someone connects to and sends messages or HTTP requests to your party
	 *
	 * @example
	 * export default class Room implements Party.Server {
	 *   constructor(readonly party: Party) {}
	 *   onConnect(connection: Party.Connection) {
	 *     this.party.broadcast("Someone connected with id " + connection.id);
	 *   }
	 * }
	 */
	export type Server = {
		/**
		 * You can define an `options` field to customise the Party.Server behaviour.
		 */
		readonly options?: ServerOptions;

		/**
		 * You can tag a connection to filter them in Party#getConnections.
		 * Each connection supports up to 9 tags, each tag max length is 256 characters.
		 */
		getConnectionTags?(
			connection: Connection,
			context: ConnectionContext,
		): string[] | Promise<string[]>;

		/**
		 * Called when the server is started, before first `onConnect` or `onRequest`.
		 * Useful for loading data from storage.
		 *
		 * You can use this to load data from storage and perform other asynchronous
		 * initialization, such as retrieving data or configuration from other
		 * services or databases.
		 */
		onStart?(): void | Promise<void>;

		/**
		 * Called when a new incoming WebSocket connection is opened.
		 */
		onConnect?(
			connection: Connection,
			ctx: ConnectionContext,
		): void | Promise<void>;

		/**
		 * Called when a WebSocket connection receives a message from a client, or another connected party.
		 */
		onMessage?(
			message: string | ArrayBuffer,
			sender: Connection,
		): void | Promise<void>;

		/**
		 * Called when a WebSocket connection is closed by the client.
		 */
		onClose?(connection: Connection): void | Promise<void>;

		/**
		 * Called when a WebSocket connection is closed due to a connection error.
		 */
		onError?(connection: Connection, error: Error): void | Promise<void>;

		/**
		 * Called when a HTTP request is made to the party URL.
		 */
		onRequest?(req: Request): Response | Promise<Response>;

		/**
		 * Called when an alarm is triggered. Use Party.storage.setAlarm to set an alarm.
		 *
		 * Alarms have access to most Party resources such as storage, but not Party.id
		 * and Party.context.parties properties. Attempting to access them will result in a
		 * runtime error.
		 */
		onAlarm?(): void | Promise<void>;
	};

	type ServerConstructor = {
		new (party: Party): Server;
	};

	/**
	 * Party.Worker allows you to customise the behaviour of the Edge worker that routes
	 * connections to your party.
	 *
	 * The Party.Worker methods can be defined as static methods on the Party.Server constructor.
	 * @example
	 * export default class Room implements Party.Server {
	 *   static onBeforeConnect(req: Party.Request) {
	 *     return new Response("Access denied", { status: 403 })
	 *   }
	 *   constructor(readonly party: Party) {}
	 * }
	 *
	 * Room satisfies Party.Worker;
	 */
	export type Worker = ServerConstructor & {
		/**
		 * Runs on any HTTP request that does not match a Party URL or a static asset.
		 * Useful for running lightweight HTTP endpoints that don't need access to the Party
		 * state.
		 **/
		onFetch?(
			req: Request,
			lobby: FetchLobby,
			ctx: ExecutionContext,
		): Response | Promise<Response>;

		/**
		 * Runs before any HTTP request is made to the party. You can modify the request
		 * before it is forwarded to the party, or return a Response to short-circuit it.
		 */
		onBeforeRequest?(
			req: Request,
			lobby: Lobby,
			ctx: ExecutionContext,
		): Request | Response | Promise<Request | Response>;

		/**
		 * Runs before any WebSocket connection is made to the party. You can modify the request
		 * before opening a connection, or return a Response to prevent the connection.
		 */
		onBeforeConnect?(
			req: Request,
			lobby: Lobby,
			ctx: ExecutionContext,
		): Request | Response | Promise<Request | Response>;
	};

	/**
	 * PartyKitServer is allows you to customise the behaviour of your Party.
	 *
	 * @note If you're starting a new project, we recommend using the newer
	 * Party.Server API instead.
	 *
	 * @example
	 * export default {
	 *   onConnect(connection, room) {
	 *     room.broadcast("Someone connected with id " + connection.id);
	 *   }
	 * }
	 */
	export type PartyKitServer = {
		/** @deprecated. Use `onFetch` instead */
		unstable_onFetch?: (
			req: Request,
			lobby: FetchLobby,
			ctx: ExecutionContext,
		) => Response | Promise<Response>;
		onFetch?: (
			req: Request,
			lobby: FetchLobby,
			ctx: ExecutionContext,
		) => Response | Promise<Response>;
		onBeforeRequest?: (
			req: Request,
			party: {
				id: string;
				env: Record<string, unknown>;
				parties: Context["parties"];
			},
			ctx: ExecutionContext,
		) => ReturnRequest | Response | Promise<ReturnRequest | Response>;

		onRequest?: (req: Request, party: Party) => Response | Promise<Response>;
		onAlarm?: (party: Omit<Party, "id" | "parties">) => void | Promise<void>;
		onConnect?: (
			connection: Connection,
			party: Party,
			ctx: ConnectionContext,
		) => void | Promise<void>;
		onBeforeConnect?: (
			req: Request,
			party: {
				id: string;
				env: Record<string, unknown>;
				parties: Context["parties"];
			},
			ctx: ExecutionContext,
		) => ReturnRequest | Response | Promise<ReturnRequest | Response>;

		/**
		 * PartyKitServer may opt into being hibernated between WebSocket
		 * messages, which enables a single server to handle more connections.
		 */
		onMessage?: (
			message: string | ArrayBuffer,
			connection: Connection,
			party: Party,
		) => void | Promise<void>;
		onClose?: (connection: Connection, party: Party) => void | Promise<void>;
		onError?: (
			connection: Connection,
			err: Error,
			party: Party,
		) => void | Promise<void>;
	};

	export type ServerOptions = {
		/**
		 * Whether the PartyKit platform should remove the server from memory
		 * between HTTP requests and WebSocket messages.
		 *
		 * The default value is `false`.
		 */
		hibernate?: boolean;
	};

	//
	// ---
	// DEPRECATIONS
	// ---
	//

	/** @deprecated use Party.Request instead */
	export type PartyRequest = Request;

	/** @deprecated use Party.Storage instead */
	export type PartyStorage = Storage;

	/** @deprecated use Party.Storage instead */
	export type PartyKitStorage = Storage;

	/** @deprecated use Party.ConnectionContext instead */
	export type PartyConnectionContext = ConnectionContext;

	/** @deprecated use Party.ConnectionContext instead */
	export type PartyKitContext = ConnectionContext;

	/** @deprecated use Party.Stub instead */
	export type PartyStub = Stub;

	/** Additional information about other resources in the current project */
	/** @deprecated use Party.Context instead */
	export type PartyContext = Context;

	/** @deprecated use Party.FetchLobby instead */
	export type PartyFetchLobby = FetchLobby;

	/** @deprecated use Party.Lobby instead */
	export type PartyLobby = Lobby;

	/** @deprecated use Party.ExecutionContext instead */
	export type PartyExecutionContext = ExecutionContext;

	/** @deprecated use Party.Connection instead */
	export type PartyConnection = Connection;

	/** @deprecated use Party.Server instead */
	export type PartyServer = Server;

	/** @deprecated use Party.Worker instead */
	export type PartyWorker = Worker;

	/** @deprecated Use `Party` instead */
	export type PartyKitRoom = Party;

	/** @deprecated Use `Party.Connection` instead */
	export type PartyKitConnection = Connection;

	/** @deprecated Use `Party.ServerOptions` instead */
	export type PartyServerOptions = ServerOptions;

	export type WebSocketEvent =
		| {
				type: "connection";
				connection: Connection;
		  }
		| {
				type: "message";
				message: string | ArrayBuffer | Buffer[];
				connection: Connection;
		  }
		| {
				type: "error";
				error: Error;
				connection: Connection;
		  }
		| {
				type: "close";
				connection: Connection;
		  };

	export function partyHandler(partyServer: {
		onStart?: ((party: Party) => void | Promise<void>) | undefined;
		onConnect?:
			| ((party: Party, connection: Connection) => void | Promise<void>)
			| undefined;
		onMessage?:
			| ((
					party: Party,
					message: any,
					connection: Connection,
			  ) => void | Promise<void>)
			| undefined;
		onClose?:
			| ((party: Party, connection: Connection) => void | Promise<void>)
			| undefined;
		onError?:
			| ((
					party: Party,
					connection: Connection,
					error: Error,
			  ) => void | Promise<void>)
			| undefined;
		onRequest?:
			| ((party: Party, req: Request) => Response | Promise<Response>)
			| undefined;
	}): EventHandler;
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