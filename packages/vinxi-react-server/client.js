/// <reference types="vinxi/types/client" />
import { createModuleLoader } from "@vinxi/react-server-dom/runtime";
import "vinxi/client";

export { ServerComponent } from "./server-component";
export { fetchServerAction } from "./fetch-server-action";

globalThis.__vite__ = createModuleLoader({
	loadModule: async (id) => {
		return import(
			/* @vite-ignore */ import.meta.env.MANIFEST["client"].chunks[id].output
				.path
		);
	},
});
