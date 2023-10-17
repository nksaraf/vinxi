import { Plugin as VitePlugin, ResolvedConfig as _ResolvedConfig } from "vite";

import { App } from "./app.js";
import { Router } from "./router-mode.js";

declare module "vite" {
	interface UserConfig {
		router?: Router;
		app?: App;
	}

	interface PluginHookUtils {
		router: Router;
		app: App;
	}
}

declare module "nitropack" {
	interface NitroDevEventHandler {
		websocket?: boolean;
	}
}

export type ViteConfig = _ResolvedConfig & { router: Router; app: App };

export type Plugin = VitePlugin;

export type { ConfigEnv as ConfigEnv } from "vite";
