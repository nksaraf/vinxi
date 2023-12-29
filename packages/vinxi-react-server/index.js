import { serverComponents } from "@vinxi/server-components/plugin";
import { serverFunctions } from "@vinxi/server-functions/plugin";
import reactRefresh from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { createApp } from "vinxi";
import { join } from "vinxi/lib/path";
import { config } from "vinxi/plugins/config";

function appEntry() {
	return config("alias", {
		resolve: {
			alias: {
				"#vinxi/app": join(process.cwd(), "app", "app.tsx"),
			},
		},
	});
}

export function defineConfig() {
	return createApp({
		routers: [
			{
				name: "public",
				mode: "static",
				dir: "./public",
			},
			{
				name: "rsc",
				worker: true,
				mode: "handler",
				base: "/_rsc",
				handler: fileURLToPath(new URL("./react-server.js", import.meta.url)),
				target: "server",
				plugins: () => [
					appEntry(),
					serverComponents.server({
						runtime: `@vinxi/react-server-dom/runtime`,
					}),
					reactRefresh(),
				],
			},

			{
				name: "client",
				mode: "spa",
				handler: fileURLToPath(new URL("./html.ts", import.meta.url)),
				plugins: () => [
					config("other", {
						resolve: {
							alias: {
								"#vinxi/app/client": fileURLToPath(
									new URL("./app/client.ts", import.meta.url),
								),
							},
						},
						server: {
							fs: {
								allow: [fileURLToPath(new URL(".", import.meta.url))],
							},
						},
					}),
					serverFunctions.client({
						runtime: fileURLToPath(
							new URL("./client-runtime.js", import.meta.url),
						),
					}),
					reactRefresh(),
					serverComponents.client({
						runtime: fileURLToPath(
							new URL("./client-runtime.js", import.meta.url),
						),
					}),
				],
				base: "/",
			},
			{
				name: "server-fns",
				worker: true,
				mode: "handler",
				base: "/_server",
				handler: fileURLToPath(new URL("./server-action.js", import.meta.url)),
				plugins: () => [
					appEntry(),
					serverFunctions.server({
						resolve: {
							conditions: ["react-server"],
						},
						runtime: `@vinxi/react-server-dom/runtime`,
					}),
					serverComponents.serverActions(),
				],
			},
		],
	});
}
