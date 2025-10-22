import { fileURLToPath } from "url";

import { client } from "./client.js";
import { server } from "./server.js";

function createHandlerService(
	/** @type {import('vinxi').HandlerServiceInput} */ t,
) {
	return t;
}

export const serverFunctions = {
	client: client,
	server: server,
	service: (
		/** @type {{ runtime?: string } & Partial<import('vinxi').HandlerServiceInput>} */ {
			runtime,
			...overrides
		} = {},
	) =>
		createHandlerService({
			name: "server-fns",
			type: "http",
			base: "/_server",
			handler: fileURLToPath(new URL("./server-handler.js", import.meta.url)),
			target: "server",
			...(overrides ?? {}),
			plugins: async () => [
				server({ runtime }),
				...((await overrides?.plugins?.()) ?? []),
			],
		}),
	router: (
		/** @type {{ runtime?: string } & Partial<import('vinxi').HandlerServiceInput>} */ {
			runtime,
			...overrides
		} = {},
	) =>
		createHandlerService({
			name: "server-fns",
			type: "http",
			base: "/_server",
			handler: fileURLToPath(new URL("./server-handler.js", import.meta.url)),
			target: "server",
			...(overrides ?? {}),
			plugins: async () => [
				server({ runtime }),
				...((await overrides?.plugins?.()) ?? []),
			],
		}),
};
