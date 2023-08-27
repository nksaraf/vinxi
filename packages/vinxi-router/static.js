/**
 *
 * @returns {import('vinxi').RouterSchema}
 */
export function publicDir({} = {}) {
	return {
		name: "public",
		mode: "static",
		dir: "./public",
	};
}
