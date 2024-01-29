import { createStack } from "./index.js";

export default createStack((app) => {
	app.addRouter({
		name: "server",
		type: "http",
		handler: "./index.ts",
		target: "server",
	});
});
