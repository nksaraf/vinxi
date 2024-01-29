import { serverFunctions } from "@vinxi/server-functions/plugin";
import { createApp } from "vinxi";

export default createApp({
	routers: [
		{
			name: "public",
			type: "static",
			dir: "./public",
		},
		{
			name: "client",
			type: "spa",
			handler: "./index.html",
			plugins: () => [serverFunctions.client()],
		},
		serverFunctions.router({
			middleware: "./app/middleware.tsx",
		}),
	],
});
