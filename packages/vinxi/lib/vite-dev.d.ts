import { Plugin as VitePlugin, ResolvedConfig as _ResolvedConfig } from "vite";

import { App } from "./app.js";
import { DevConfig } from "./dev-server.js";
import { Service } from "./service-modes.js";

declare module "vite" {
	interface UserConfig {
		// @deprecated
		router?: Service;
		service: Service;
		app: App;
		dev?: DevConfig;
	}

	interface PluginHookUtils {
		// @deprecated
		router: Service;
		service: Service;
		app: App;
		dev: DevConfig;
	}
}

declare module "nitropack" {
	interface NitroDevEventHandler {
		websocket?: boolean;
	}
}

export type ViteConfig = _ResolvedConfig & {
	// @deprecated
	router: Service;
	service: Service;
	app: App;
};

export type Plugin = VitePlugin;

export type CustomizableConfig = Omit & {
	build?: Omit & {
		rollupOptions?: Omit;
	};
};

export type { ConfigEnv as ConfigEnv } from "vite";
