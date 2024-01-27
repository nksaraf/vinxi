export function getManifest(/** @type {string} */ router) {
	return globalThis.MANIFEST[router];
}
