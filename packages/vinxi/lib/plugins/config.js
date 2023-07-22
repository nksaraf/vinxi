/**
 * 
 * @param {string} tag 
 * @param {import('vite').UserConfig} conf 
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
