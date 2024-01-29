import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";
import { config } from "vinxi/plugins/config";
import { virtual } from "vinxi/plugins/virtual";

function viteServer() {
	let router;
	return [
		{
			configResolved(config) {
				router = config.router;
			},
			name: "vite-dev-server",
			configureServer(server) {
				globalThis.viteServers ??= {};
				globalThis.viteServers[router.name] = server;
			},
		},
		virtual({
			"#vite-dev-server": ({ env }) =>
				env.command === "build"
					? `export default undefined`
					: `export default viteServers['${router.name}']`,
		}),
	];
}

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
			type: "client",
			handler: "./app/client.tsx",
			target: "browser",
			plugins: () => [reactRefresh()],
			base: "/_build",
		},
		{
			name: "ssr",
			type: "handler",
			handler: "./app/server.tsx",
			target: "server",
			plugins: () => [
				viteServer(),
				config("kv", {
					define: {
						"import.meta.env.cloudflare": "globalThis.cloudflare",
					},
				}),
			],
		},
	],
});
