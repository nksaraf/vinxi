import { createStack } from "./index.js";

export default createStack((app) => {
	app.addRouter({
		name: "public",
		mode: "static",
		dir: "./public",
	});
});
