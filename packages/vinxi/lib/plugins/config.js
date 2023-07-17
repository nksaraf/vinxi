export function config(tag, conf) {
	return {
		name: `vinxi:config:${tag}`,
		config() {
			return { ...conf };
		},
	};
}
