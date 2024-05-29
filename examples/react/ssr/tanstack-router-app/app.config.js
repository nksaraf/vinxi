import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import { serverFunctions } from "@vinxi/server-functions/plugin";
import { serverTransform } from "@vinxi/server-functions/server";
import reactRefresh from "@vitejs/plugin-react";
import { resolve } from "import-meta-resolve";
import * as path from "path";
import { createApp } from "vinxi";

const resolveToRelative = (p) => {
	const toAbsolute = (file) => file.split("://").at(-1);

	const resolved = toAbsolute(resolve(p, import.meta.url));

	const relative = path.relative(
		path.resolve(toAbsolute(import.meta.url), ".."),
		resolved,
	);

	return relative;
};

export default createApp({
	routers: [
		{
			name: "public",
			type: "static",
			dir: "./public",
			base: "/",
		},
		{
			name: "ssr",
			type: "http",
			handler: "./app/server.tsx",
			target: "server",
			plugins: () => [
				reactRefresh(),
				serverTransform({
					runtime: `@tanstack/react-router-server/server-runtime`,
				}),
				TanStackRouterVite(),
			],
		},
		{
			name: "client",
			type: "client",
			handler: "./app/client.tsx",
			target: "browser",
			plugins: () => [
				serverFunctions.client({
					runtime: `@tanstack/react-router-server/client-runtime`,
				}),
				reactRefresh(),
				TanStackRouterVite(),
			],
			base: "/_build",
		},
		serverFunctions.router({
			name: "server",
			handler: resolveToRelative(
				"@tanstack/react-router-server/server-handler",
			),
			runtime: `@tanstack/react-router-server/server-runtime`,
		}),
	],
});
