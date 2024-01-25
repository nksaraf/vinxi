import { HTTPSOptions } from "@vinxi/listhen";

export type App = {
	config: {
		name: string;
		devtools: boolean;
		server: import("nitropack").NitroConfig & {
			https?: HTTPSOptions | boolean;
		};
		routers: import("./router-mode.js").Router[];
		root: string;
	};
	addRouter: (router: any) => App;
	getRouter: (name: string) => import("./router-mode.js").Router;
	stack: (stack: any) => App;
	dev(): Promise<void>;
	build(): Promise<void>;
	hooks: import("hookable").Hookable;
};
