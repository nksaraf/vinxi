import { Plugin as VitePlugin, ResolvedConfig as _ResolvedConfig } from "vite";

import { RouterSchema } from "./app";

declare module "vite" {
	interface UserConfig {
		router?: RouterSchema;
	}

	interface PluginHookUtils {
		router: RouterSchema;
	}
}

export type ViteConfig = _ResolvedConfig & { router: RouterSchema };

export type Plugin = VitePlugin;

export type { ConfigEnv as ConfigEnv } from "vite";
