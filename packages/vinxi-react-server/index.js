import { references } from "@vinxi/plugin-references";
import reactRefresh from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { createApp } from "vinxi";
import { join } from "vinxi/path";
import { config } from "vinxi/plugins/config";

export function defineConfig() {
	return createApp({
		server: {
			plugins: [references.serverPlugin],
			virtual: {
				[references.serverPlugin]: references.serverPluginModule({
					routers: ["server", "rsc"],
				}),
			},
		},
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

				build: {
					target: "server",
					plugins: () => [
						config("alias", {
							resolve: {
								alias: {
									"#vinxi/app": join(process.cwd(), "app", "app.tsx"),
								},
							},
						}),
						references.serverComponents({
							runtime: `@vinxi/react-server-dom/runtime`,
						}),
						reactRefresh(),
					],
				},
			},
			{
				name: "client",
				mode: "spa",
				handler: "./index.html",
				build: {
					target: "browser",
					plugins: () => [
						references.clientRouterPlugin({
							runtime: `@vinxi/react-server-dom/runtime`,
						}),
						reactRefresh(),
						references.clientComponents({
							runtime: `@vinxi/react-server-dom/runtime`,
						}),
					],
				},
				base: "/",
			},
			{
				name: "server",
				worker: true,
				mode: "handler",
				base: "/_server",
				handler: fileURLToPath(new URL("./server-action.js", import.meta.url)),
				build: {
					target: "server",
					plugins: () => [
						config("alias", {
							resolve: {
								alias: {
									"#vinxi/app": join(process.cwd(), "app", "app.tsx"),
								},
							},
						}),
						references.serverRouterPlugin({
							resolve: {
								conditions: ["react-server"],
							},
							runtime: `@vinxi/react-server-dom/runtime`,
						}),
					],
				},
			},
		],
	});
}
