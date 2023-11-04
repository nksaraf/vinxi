import { createStack } from "vinxi/stack";

import { serverFunctions } from "./plugin.js";

export default function serverFns(app) {
	app.addRouter(serverFunctions.router());
	const clientRouters = app.config.routers.filter(
		(router) => router.target === "browser",
	);

	clientRouters.forEach((router) => {
		if (router.plugins) {
			router.plugins = () => [serverFunctions.client(), ...router.plugins()];
		} else if (router.plugins === undefined) {
			router.plugins = () => [serverFunctions.client()];
		}
	});
}
