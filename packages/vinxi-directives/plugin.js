import { decorateExportsPlugin, shimExportsPlugin } from "./transform";

/**
 *
 * @param {*} param0
 * @returns {import('vinxi').Plugin}
 */

export function directives({
	hash = (str) => str,
	onReference = (type, ref) => {},
	runtime = "",
	transforms = [
		// decorateExportsPlugin({
		// 	runtime: {
		// 		module: runtime,
		// 		function: "createServerReference",
		// 	},
		// 	onModuleFound: (mod) => onReference("server", mod),
		// 	hash: hash,
		// 	apply: (code, id, options) => {
		// 		return options.ssr;
		// 	},
		// 	pragma: "use server",
		// }),
		// shimExportsPlugin({
		// 	runtime: {
		// 		module: runtime,
		// 		function: "createClientReference",
		// 	},
		// 	onModuleFound: (mod) => onReference("client", mod),
		// 	hash: hash,
		// 	apply: (code, id, options) => {
		// 		return options.ssr;
		// 	},
		// 	pragma: "use client",
		// }),
	],
} = {}) {
	let command;
	return {
		name: "vite-server-references",
		enforce: "pre",
		configResolved(config) {
			command = config.command;
		},
		async transform(code, id, options) {
			const vite = this;
			const opts = {
				...(options ?? {}),
			};
			opts.command = command;
			opts.vite = vite;
			const [url, query] = id.split("?");
			const searchParams = new URLSearchParams(query);

			if (searchParams.has("split")) {
				for (var transform of transforms) {
					if (transform.split) {
						try {
							const splitCode = await transform.split(code, id, {
								...opts,
								split: Number(searchParams.get("split")),
							});
							return splitCode;
						} catch (e) {
							console.error(e);
						}
					}
				}

				throw new Error("no split handler");
			}

			if (id.endsWith(".css")) {
				return;
			}

			if (id.includes("actions")) {
				console.log(code);
			}

			for (var transform of transforms) {
				if (transform.transform) {
					code = await transform.transform(code, id, opts);
				}
			}

			if (id.includes("actions")) {
				console.log(code);
			}
			return code;
		},
	};
}
