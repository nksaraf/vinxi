import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";
import { NextJSPagesFileSystemRouter } from "vinxi/file-system-router";

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
			mode: "build",
			dir: "./app/pages",
			style: NextJSPagesFileSystemRouter,
			handler: "./app/client.tsx",
			build: {
				target: "browser",
				plugins: () => [reactRefresh()],
			},
			base: "/_build",
		},
		{
			name: "ssr",
			mode: "handler",
			handler: "./app/server.tsx",
			dir: "./app/pages",
			style: NextJSPagesFileSystemRouter,
			build: {
				target: "server",
			},
		},
	],
});
