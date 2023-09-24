import { Plugin as VitePlugin, ResolvedConfig as _ResolvedConfig } from "vite";

import { RouterSchema } from "./app-router-mode.js";
import { Router } from "./router-mode.js";

declare module "vite" {
	interface UserConfig {
		router?: Router<any>;
	}

	interface PluginHookUtils {
		router: Router<any>;
	}
}

declare module "nitropack" {
	interface NitroDevEventHandler {
		websocket?: boolean;
	}
}

export type ViteConfig = _ResolvedConfig & { router: Router<any> };

export type Plugin = VitePlugin;

export type { ConfigEnv as ConfigEnv } from "vite";
