import { createStack } from "./index.js";

export default createStack((app) => {
	app.addRouter({
		name: "client",
		mode: "spa",
		handler: "./index.html",
		target: "browser",
	});
});
