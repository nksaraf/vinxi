/**
 *
 * @param {string} routerName
 * @returns {import('../types/manifest').Manifest}
 */
export function getManifest(routerName) {
	return globalThis.MANIFEST[routerName];
}

export const routerName = /** __PURE__ */ import.meta.env.ROUTER_NAME;
export const routerType = /** __PURE__ */ import.meta.env.ROUTER_TYPE;
export const routerHandler = /** __PURE__ */ import.meta.env.ROUTER_HANDLER;
export const routerBaseURL = /** __PURE__ */ import.meta.env.BASE_URL;
export const isDev = /** __PURE__ */ import.meta.env.DEV;
export const isProd = /** __PURE__ */ import.meta.env.PROD;
export const isTest = /** __PURE__ */ import.meta.env.TEST;
export const isSSR = /** __PURE__ */ import.meta.env.SSR;
export const serverBaseURL /** __PURE__ */ = import.meta.env.SERVER_BASE_URL;

export const env = /** __PURE__ */ {};
