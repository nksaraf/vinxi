import type { EventHandler } from "h3";

import { App } from "./app.js";
import { DevConfig } from "./dev-server.js";
import { Internals } from "./service-modes.js";

type PublicAsset = {
	baseURL?: string | undefined;
	fallthrough?: boolean | undefined;
	maxAge?: number | undefined;
	dir?: string | undefined;
};

type DevHandler = {
	route: string;
	handler: EventHandler;
};

type Service<T = {}> = T & {
	base: string;
	type: string;
	internals: Internals;
	order: number;
	outDir: string;
	target: "server" | "browser" | "static";
	root: string;
	name: string;
	handler?: string;
	build?: false;
	server?: {
		hmr?: Exclude;
	};
};

export type ServiceMode<T extends any = any> = {
	name: string;
	dev: {
		publicAssets?: (
			service: Service,
			app: import("./app.js").App,
		) => PublicAsset | PublicAsset[] | undefined | void;
		plugins?: (
			service: Service,
			app: import("./app.js").App,
		) => Promise | undefined | void;
		handler?: (
			service: Service,
			app: App,
			serveConfig: DevConfig,
		) => Promise | DevHandler | DevHandler[] | undefined | void;
	};
	resolveConfig: (
		service: T,
		appConfig: import("./app.js").AppOptions,
		order?: number,
	) => T;
};
