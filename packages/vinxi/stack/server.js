import { createStack } from "./index.js";

export default createStack((app) => {
	app.addRouter({
		name: "server",
		type: "handler",
		handler: "./index.ts",
		target: "server",
	});
});
