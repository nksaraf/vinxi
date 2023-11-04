import reactRefresh from "@vitejs/plugin-react";
import { serverFunctions } from "@vinxi/server-functions";
import { createApp } from "vinxi";

export default createApp({
	routers: [
		{
			name: "public",
			mode: "static",
			dir: "./public",
			base: "/",
		},
		{
			name: "client",
			mode: "spa",
			handler: "./index.html",
			target: "browser",
			plugins: () => [serverFunctions.client(), reactRefresh()],
		},
		serverFunctions.router()
	],
});
