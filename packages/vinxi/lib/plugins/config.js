export function config(conf) {
	return {
		name: "vinxi:config",
		config() {
			return { ...conf };
		},
	};
}
