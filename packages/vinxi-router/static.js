/**
 *
 * @returns {import('vinxi').ServiceSchemaInput}
 */
export function publicDir({ ...options } = {}) {
	return {
		name: "public",
		type: "static",
		dir: "./public",
		...options,
	};
}
