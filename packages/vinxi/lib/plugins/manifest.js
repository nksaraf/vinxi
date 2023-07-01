export function manifest() {
	let router;

	return {
		name: "vinxi:manifest",
		config(config) {
			router = config.router;
			return {
				define: {
					"import.meta.env.MANIFEST": `globalThis.MANIFEST`,
					"import.meta.env.ROUTER_NAME": JSON.stringify(router.name),
					"import.meta.env.HANDLER": JSON.stringify(router.handler),
					"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
				},
			};
		},
		async load(id) {
			if (id.startsWith("/@manifest")) {
				const [path, query] = id.split("?");
				const params = new URLSearchParams(query);
				if (path.endsWith("assets")) {
					return `export default ${JSON.stringify(
						await globalThis.MANIFEST[router.name].inputs[
							params.get("id")
						].assets(),
					)}`;
				}
			}
		},
	};
}
