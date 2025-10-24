import { HTTPSOptions } from "@vinxi/listhen";

export type App = {
	config: {
		name: string;
		devtools: boolean;
		server: import("nitropack").NitroConfig & {
			https?: HTTPSOptions | boolean;
		};
		services: import("./service-mode.js").Service[];
		routers: import("./service-mode.js").Service[];
		root: string;
	};
	// @deprecated
	addRouter: (router: any) => App;
	// @deprecated
	getRouter: (name: string) => import("./service-mode.js").Service;
	getService: (name: string) => import("./service-mode.js").Service;
	addService: (service: import("./service-modes.js").ServiceSchemaInput) => App;
	stack: (stack: any) => App;
	dev(): Promise<void>;
	build(): Promise<void>;
	hooks: import("hookable").Hookable;
};
