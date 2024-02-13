export * from "unstorage";

/**
 *
 * @param {import('unstorage/drivers/fs').FSStorageOptions} options
 */
export async function fsDriver(options) {
	return (await import("unstorage/drivers/fs")).default(options);
}

/**
 *
 * @param {import('unstorage/drivers/http').HTTPOptions} options
 */
export async function httpDriver(options) {
	return (await import("unstorage/drivers/http")).default(options);
}

/**
 *
 */
export async function memoryDriver() {
	return (await import("unstorage/drivers/memory")).default();
}

/**
 *
 * @param {import('unstorage/drivers/overlay').OverlayStorageOptions} options
 */
export async function overlayDriver(options) {
	return (await import("unstorage/drivers/overlay")).default(options);
}
