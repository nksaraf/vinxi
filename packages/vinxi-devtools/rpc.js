/**
 *
 * @returns {import('vinxi').App}
 */
const getApp = () => {
	return globalThis.app;
};
export const functions = {
	add: () => {},
	getRouterNames: () => {
		return getApp().config.routers.map((router) => router.name);
	},
};
