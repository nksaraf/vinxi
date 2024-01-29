/**
 *
 * @returns {import('vinxi').RouterSchemaInput}
 */
export function publicDir({ ...options } = {}) {
	return {
		name: "public",
		type: "static",
		dir: "./public",
		...options,
	};
}
