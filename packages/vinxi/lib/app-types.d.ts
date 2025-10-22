import { HTTPSOptions } from "@vinxi/listhen";

export type App = {
	config: {
		name: string;
		devtools: boolean;
		server: import("nitropack").NitroConfig & {
			https?: HTTPSOptions | boolean;
		};
		routers: import("./service-mode.js").Service[];
		root: string;
	};
	addRouter: (router: any) => App;
	getRouter: (name: string) => import("./service-mode.js").Service;
	getService: (name: string) => import("./service-mode.js").Service;
	addService: (service: import("./service-modes.js").ServiceSchemaInput) => App;
	stack: (stack: any) => App;
	dev(): Promise;
	build(): Promise;
	hooks: import("hookable").Hookable;
};
