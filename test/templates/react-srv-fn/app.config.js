import reactRefresh from "@vitejs/plugin-react";
import { serverFunctions } from "@vinxi/plugin-server-functions";
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
		{
			name: "server",
			mode: "handler",
			base: "/_server",
			handler: "./app/server-handler.js",
			target: "server",
			plugins: () => [serverFunctions.server()],
		},
	],
});
