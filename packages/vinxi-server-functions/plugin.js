import { fileURLToPath } from "url";

import { client } from "./client.js";
import { server } from "./server.js";

function createHandlerRouter(
	/** @type {import('vinxi').HandlerRouterInput} */ t,
) {
	return t;
}

export const serverFunctions = {
	client: client,
	server: server,
	router: (
		/** @type {{ runtime?: string } & Partial<import('vinxi').HandlerRouterInput>} */ {
			runtime,
			...overrides
		} = {},
	) =>
		createHandlerRouter({
			name: "server-fns",
			mode: "handler",
			base: "/_server",
			handler: fileURLToPath(new URL("./server-handler.js", import.meta.url)),
			target: "server",
			...(overrides ?? {}),
			plugins: () => [server({ runtime }), ...(overrides?.plugins?.() ?? [])],
		}),
};
