import { fileURLToPath } from "url";

import { chunksServerVirtualModule } from "./chunks.js";
import { clientComponents } from "./client-components.js";
import { client } from "./client.js";
import { serverComponents } from "./server-components.js";
import { server } from "./server.js";
import { transformReferences } from "./transform-references.js";

export const references = {
	serverPlugin: "#extra-chunks",
	serverPluginModule: chunksServerVirtualModule,
	transformReferences,
	clientRouterPlugin: client,
	serverRouterPlugin: server,
	clientComponents,
	serverComponents,
	serverRouter: () => ({
		name: "server",
		mode: "handler",
		base: "/_server",
		handler: fileURLToPath(new URL("./server-handler.js", import.meta.url)),
		build: {
			target: "node",
			plugins: () => [server()],
		},
	}),
};
