import { fileURLToPath } from "url";

import { client } from "./client.js";
import { serverActions } from "./server-action.js";
import { server } from "./server.js";

export const serverComponents = {
	client: client,
	server: server,
	serverActions: serverActions,
	serverRouter: (overrides) => ({
		name: "server",
		mode: "handler",
		base: "/_server",
		handler: fileURLToPath(new URL("./server-handler.js", import.meta.url)),
		target: "server",
		...(overrides ?? {}),
		plugins: () => [server(), ...(overrides?.plugins?.() ?? [])],
	}),
};
