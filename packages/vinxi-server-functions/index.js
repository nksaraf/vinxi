import { createStack } from "vinxi/stack";

import { serverFunctions } from "./plugin.js";

export default function serverFns(app) {
	app.addRouter(serverFunctions.router());
	app.addRouterPlugins(
		(router) => router.target === "browser",
		() => [serverFunctions.client()],
	);
}
