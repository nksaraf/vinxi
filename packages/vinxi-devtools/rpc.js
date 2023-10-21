/**
 *
 * @returns {import('vinxi').App}
 */
const getApp = () => {
	return globalThis.app;
};
export const functions = {
	add: () => {
		console.log("adding hello");
	},
	getRouterNames: () => {
		return getApp().config.routers.map((router) => router.name);
	},
};
