import { serverFunctions } from "@vinxi/plugin-server-functions";
import { createApp } from "vinxi";

export default createApp({
	routers: [
		{
			name: "public",
			mode: "static",
			dir: "./public",
		},
		{
			name: "client",
			mode: "spa",
			handler: "./index.html",
			target: "browser",
			plugins: () => [serverFunctions.clientPlugin()],
		},
		serverFunctions.router({
			middleware: "./app/middleware.tsx",
		}),
	],
});
