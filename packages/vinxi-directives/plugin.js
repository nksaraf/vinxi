/**
 *
 * @param {*} param0
 * @returns {import('vinxi').Plugin}
 */

export function directives({ transforms = [] } = {}) {
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
						console.log(transform.name, id);
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

			let result = { code, map: null };

			for (const transform of transforms) {
				if (transform.transform) {
					result = await transform.transform(result.code, id, {
						...opts,
						map: result.map,
					});
				}
			}

			return result;
		},
	};
}
