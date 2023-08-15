import { virtual } from "./virtual";

export function viteServer() {
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
