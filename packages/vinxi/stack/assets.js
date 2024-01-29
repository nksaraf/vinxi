import { createStack } from "./index.js";

export default createStack((app) => {
	app.addRouter({
		name: "public",
		type: "static",
		dir: "./public",
	});
});
