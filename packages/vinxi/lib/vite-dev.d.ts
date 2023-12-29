import { Plugin as VitePlugin, ResolvedConfig as _ResolvedConfig } from "vite";

import { App } from "./app.js";
import { DevConfig } from "./dev-server.js";
import { Router } from "./router-mode.js";

declare module "vite" {
	interface UserConfig {
		router?: Router;
		app?: App;
		dev?: DevConfig;
	}

	interface PluginHookUtils {
		router: Router;
		app: App;
		dev: DevConfig;
	}
}

declare module "nitropack" {
	interface NitroDevEventHandler {
		websocket?: boolean;
	}
}

export type ViteConfig = _ResolvedConfig & { router: Router; app: App };

export type Plugin = VitePlugin;

export type CustomizableConfig = Omit<
	import("vite").InlineConfig,
	| "appType"
	| "app"
	| "router"
	| "base"
	| "root"
	| "publicDir"
	| "mode"
	| "server"
	| "preview"
	| "clearScreen"
	| "configFile"
	| "envFile"
> & {
	build?: Omit<
		import("vite").InlineConfig["build"],
		"outDir" | "ssr" | "ssrManifest" | "rollupOptions"
	> & {
		rollupOptions?: Omit<import("vite").BuildOptions["rollupOptions"], "input">;
	};
};

export type { ConfigEnv as ConfigEnv } from "vite";
