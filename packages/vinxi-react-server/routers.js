import { references } from "@vinxi/plugin-references";
import reactRefresh from "@vitejs/plugin-react";

export function serverChunks() {
	return {
		plugins: [references.serverPlugin],
		virtual: {
			[references.serverPlugin]: references.serverPluginModule({
				routers: ["server", "rsc"],
			}),
		},
	};
}
/**
 *
 * @returns {import("vinxi").RouterSchema}
 */
export function reactServerRouter() {
	return {
		name: "rsc",
		worker: true,
		mode: "handler",
		base: "/_rsc",
		handler: "./app/react-server.tsx",
		build: {
			target: "server",
			plugins: () => [references.serverComponents(), reactRefresh()],
		},
	};
}
/**
 *
 * @returns {import("vinxi").RouterSchema}
 */
export function reactClient() {
	return {
		name: "client",
		mode: "spa",
		handler: "./index.html",
		build: {
			target: "browser",
			plugins: () => [
				references.clientRouterPlugin(),
				reactRefresh(),
				references.clientComponents(),
			],
		},
		base: "/",
	};
}
/**
 *
 * @returns {import("vinxi").RouterSchema}
 */
export function serverActionRouter() {
	return {
		name: "server",
		worker: true,
		mode: "handler",
		base: "/_server",
		handler: "./app/server-action.tsx",
		build: {
			target: "server",
			plugins: () => [
				references.serverRouterPlugin({
					resolve: {
						conditions: ["react-server"],
					},
				}),
			],
		},
	};
}
/**
 *
 * @returns {import("vinxi").RouterSchema}
 */
export function publicDirRouter() {
	return {
		name: "public",
		mode: "static",
		dir: "./public",
	};
}
