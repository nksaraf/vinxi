/**
 *
 * @param {string} tag
 * @param {Omit<import('vite').InlineConfig, 'router'>} conf
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
