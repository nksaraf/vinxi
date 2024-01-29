import { serverFunctions } from "@vinxi/server-functions/plugin";
import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";

export default createApp({
	routers: [
		{
			name: "public",
			type: "static",
			dir: "./public",
			base: "/",
		},
		{
			name: "client",
			type: "spa",
			handler: "./index.html",
			target: "browser",
			plugins: () => [serverFunctions.client(), reactRefresh()],
		},
		serverFunctions.router({
			middleware: "./app/middleware.ts",
		}),
	],
});
