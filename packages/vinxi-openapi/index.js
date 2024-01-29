import { fileURLToPath } from "node:url";

export function openapi() {
	return {
		name: "docs",
		type: "http",
		base: "/spec",
		handler: fileURLToPath(new URL("./handler.js", import.meta.url)),
		target: "server",
	};
}
