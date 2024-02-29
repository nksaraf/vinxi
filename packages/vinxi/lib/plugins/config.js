/**
 *
 * @param {string} tag
 * @param {import('../vite-dev.d.ts').CustomizableConfig | ((router: import('../router-mode.d.ts').Router, app: import('../app-types.d.ts').App, env:import('../vite-dev.d.ts').ConfigEnv) => import('../vite-dev.d.ts').CustomizableConfig) } conf
 * @returns {import('../vite-dev.d.ts').Plugin}
 */
export function config(tag, conf) {
	return {
		name: `vinxi:config:${tag}`,

		// @ts-ignore
		config(c, env) {
			let overrides =
				typeof conf === "function" ? conf(c.router, c.app, env) : conf;
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
