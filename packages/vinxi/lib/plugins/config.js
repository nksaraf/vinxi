/**
 *
 * @param {string} tag
 * @param {import('../vite-dev.d.ts').CustomizableConfig | ((service: import('../service-mode.js').Service, app: import('../app-types.d.ts').App, env:import('../vite-dev.d.ts').ConfigEnv) => import('../vite-dev.d.ts').CustomizableConfig) } conf
 * @returns {import('../vite-dev.d.ts').Plugin}
 */
export function config(tag, conf) {
	return {
		name: `vinxi:config:${tag}`,

		// @ts-ignore
		config(c, env) {
			let overrides =
				typeof conf === "function" ? conf(c.service, c.app, env) : conf;
			return { ...overrides };
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
