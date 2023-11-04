import { createStack } from "./index.js";

export default createStack(async (app) => {
	const { default: reactRefresh } = await app.import("@vitejs/plugin-react");

	app.addRouterPlugins(
		(router) => router.target === "browser",
		() => [reactRefresh()],
	);
});
