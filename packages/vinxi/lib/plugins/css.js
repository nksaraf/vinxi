export function css() {
	/** @type {import('vite').ViteDevServer} */
	let viteServer;
	/** @type {import('../vite-dev.d.ts').Plugin} */
	const plugin = {
		name: "vinxi:css-hmr",
		configureServer(dev) {
			viteServer = dev;
		},
		async handleHotUpdate({ file, read, server, modules }) {
			if (file.endsWith(".css")) {
				let { code } = await server.transformRequest(file);
				code = JSON.parse(
					code
						.match(/const __vite__css = .*\n/)[0]
						.slice("const __vite__css = ".length),
				);
				viteServer.ws.send({
					type: "custom",
					event: "css-update",
					data: {
						file,
						contents: code,
					},
				});
				return [];
			}
		},
	};

	return plugin;
}
