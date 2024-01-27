/**
 *
 * @param {string} routerName
 * @returns {import('../types/manifest').Manifest}
 */
export function getManifest(routerName) {
	return globalThis.MANIFEST[routerName];
}
