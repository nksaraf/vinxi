/**
 *
 * @param {string} tag
 * @param {import('vite').InlineConfig} conf
 * @returns
 */
export function config(tag, conf) {
	return {
		name: `vinxi:config:${tag}`,
		config() {
			return { ...conf };
		},
	};
}
