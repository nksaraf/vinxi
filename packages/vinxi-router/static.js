/**
 *
 * @returns {import('vinxi').RouterSchemaInput}
 */
export function publicDir({ ...options } = {}) {
	return {
		name: "public",
		mode: "static",
		dir: "./public",
		...options,
	};
}
