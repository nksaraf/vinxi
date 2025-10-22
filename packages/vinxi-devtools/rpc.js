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
		return getApp().config.services.map((service) => service.name);
	},
};
