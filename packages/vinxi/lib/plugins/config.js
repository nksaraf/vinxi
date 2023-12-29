/**
 *
 * @param {string} tag
 * @param {import('../vite-dev.d.ts').CustomizableConfig} conf
 * @returns {import('../vite-dev.d.ts').Plugin}
 */
export function config(tag, conf) {
	return {
		name: `vinxi:config:${tag}`,
		// @ts-ignore
		config() {
			return { ...conf };
		},
	};
}

/**
 *
 * @param {string} path
 * @param {string} file
 * @returns {import('../vite-dev.d.ts').Plugin}
 */
export function input(path, file) {
	return config(`input-${path}`, {
		resolve: {
			alias: {
				[path]: file,
			},
		},
	});
}
