import react from "@vitejs/plugin-react";
import unocss from "unocss/vite";

import { fileURLToPath } from "node:url";

import unocssConfig from "./uno.config.js";

export const devtoolsClientDev = () => {
	return {
		name: "devtools-client",
		mode: "spa",
		handler: fileURLToPath(new URL("./index.html.js", import.meta.url)),
		target: "browser",
		base: "/__devtools/client",
		plugins: () => [unocss(unocssConfig), react()],
	};
};
