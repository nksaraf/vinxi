import unocss from "unocss/vite";
import { config } from "vinxi/plugins/config";
import solid from "vite-plugin-solid";

import { fileURLToPath } from "node:url";

import unocssConfig from "./uno.config.js";

/** @returns {import('vinxi').RouterSchemaInput} */
export const devtoolsClientDev = () => {
	return {
		name: "devtools-client",
		mode: "spa",
		handler: fileURLToPath(new URL("./index.html.js", import.meta.url)),
		target: "browser",
		base: "/__devtools/client",
		plugins: () => [
			unocss(unocssConfig),
			solid(),
			{
				name: "remove-vinxi-inject",
				config(config) {
					return {
						plugins: config.plugins
							.flat()
							.filter((plugin) => plugin?.name !== "vinxi:inject-client"),
					};
				},
			},
		],
	};
};
