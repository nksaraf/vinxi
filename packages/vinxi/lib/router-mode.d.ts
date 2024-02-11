import type { EventHandler } from "h3";

import { App } from "./app.js";
import { DevConfig } from "./dev-server.js";
import { Internals } from "./router-modes.js";

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

type Router<T = {}> = T & {
	base: string;
	type: string;
	internals: Internals;
	order: number;
	outDir: string;
	target: "server" | "browser" | "static";
	root: string;
	name: string;
	handler?: string;
};

export type RouterMode<T extends any = any> = {
	name: string;
	dev: {
		publicAssets?: (
			router: Router<T>,
			app: import("./app.js").App,
		) => PublicAsset | PublicAsset[] | undefined | void;
		plugins?: (
			router: Router<T>,
			app: import("./app.js").App,
		) => Promise<(import("./vite-dev.js").Plugin | null)[]> | undefined | void;
		handler?: (
			router: Router<T>,
			app: App,
			serveConfig: DevConfig,
		) =>
			| Promise<DevHandler | DevHandler[]>
			| DevHandler
			| DevHandler[]
			| undefined
			| void;
	};
	resolveConfig: (
		router: T,
		appConfig: import("./app.js").AppOptions,
		order?: number,
	) => T;
};
