import { EventHandler } from "h3";

import {
	Internals,
	RouterSchema,
	RouterSchemaInput,
} from "./app-router-mode.js";
import { App } from "./app.js";
import { ServeConfig } from "./dev-server.js";

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
		appConfig: import("./app.js").AppOptions,
		order?: number,
	) => T;
};
