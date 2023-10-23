import { fileURLToPath } from "url";

import { client } from "./client.js";
import { server } from "./server.js";

export const serverFunctions = {
	clientPlugin: client,
	serverPlugin: server,
	router: (overrides) => ({
		name: "server",
		mode: "handler",
		base: "/_server",
		handler: fileURLToPath(new URL("./server-handler.js", import.meta.url)),
		target: "server",
		...(overrides ?? {}),
		plugins: () => [server(), ...(overrides?.plugins?.() ?? [])],
	}),
};
