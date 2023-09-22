/**
 *
 * @param {string} tag
 * @param {import('vite').InlineConfig} conf
 * @returns {import('../vite-dev.d.ts').Plugin}
 */
export function config(tag, conf) {
	return {
		name: `vinxi:config:${tag}`,
		config() {
			return { ...conf };
		},
	};
}
