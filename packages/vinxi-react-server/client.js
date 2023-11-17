/// <reference types="vinxi/types/client" />
import { createModuleLoader } from "@vinxi/react-server-dom/runtime";
import "vinxi/client";

export { ServerComponent } from "./server-component";
export { fetchServerAction } from "./fetch-server-action";

globalThis.__vite__ = createModuleLoader({
	loadModule: async (id) => {
		return import.meta.env.MANIFEST[import.meta.env.ROUTER_NAME].chunks[
			id
		].import();
	},
});
