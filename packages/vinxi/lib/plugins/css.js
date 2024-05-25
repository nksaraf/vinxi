import { isCssModulesFile } from "../manifest/collect-styles.js";

export function css() {
	/** @type {import('vite').ViteDevServer} */
	let viteServer;
	let cssModules = {};
	/** @type {import('../vite-dev.d.ts').Plugin} */
	const plugin = {
		name: "vinxi:css-hmr",
		configureServer(dev) {
			viteServer = dev;
			viteServer.cssModules = cssModules;
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
			}
		},
		transform(code, id) {
			if (isCssModulesFile(id)) {
				cssModules[id] = code;
			}
		},
	};

	return plugin;
}
