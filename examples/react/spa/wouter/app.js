import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";
import { NextJSPagesFileSystemRouter } from "vinxi/file-system-router";

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
			dir: "./app/pages",
			style: NextJSPagesFileSystemRouter,
			build: {
				target: "browser",
				plugins: () => [reactRefresh()],
			},
		},
	],
});
