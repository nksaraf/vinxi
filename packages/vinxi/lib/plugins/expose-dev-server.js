import { virtual } from "./virtual";

export function viteServer() {
	let service;
	return [
		{
			configResolved(config) {
				service = config.service;
			},
			name: "vite-dev-server",
			configureServer(server) {
				globalThis.viteServers ??= {};
				globalThis.viteServers[service.name] = server;
			},
		},
		virtual({
			"#vite-dev-server": ({ env }) =>
				env.command === "build"
					? `export default undefined`
					: `export default viteServers['${service.name}']`,
		}),
	];
}
