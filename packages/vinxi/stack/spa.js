import { createStack } from "./index.js";

export default createStack((app) => {
	app.addRouter({
		name: "client",
		type: "spa",
		handler: "./index.html",
		target: "browser",
	});
});
