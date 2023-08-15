import { chunksServerVirtualModule } from "@vinxi/plugin-references/chunks";
import { client } from "@vinxi/plugin-references/client";
import { clientComponents } from "@vinxi/plugin-references/client-components";
import { server } from "@vinxi/plugin-references/server";
import { serverComponents } from "@vinxi/plugin-references/server-components";
import { transformReferences } from "@vinxi/plugin-references/transform-references";
import { fileURLToPath } from "url";

export const references = {
	serverPlugin: "#server-chunks",
	serverPluginModule: chunksServerVirtualModule,
	transformReferences,
	clientRouterPlugin: client,
	clientComponents,
	serverComponents,
	serverRouterPlugin: server,
	serverRouter: () => ({
		name: "server",
		mode: "handler",
		base: "/_server",
		handler: fileURLToPath(new URL("./server.js", import.meta.url)),
		build: {
			target: "node",
			plugins: () => [references.serverRouterPlugin()],
		},
	}),
};
