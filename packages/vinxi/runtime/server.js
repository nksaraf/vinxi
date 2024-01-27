import {
	H3Error,
	H3Event,
	MIMES,
	appendCorsHeaders,
	appendCorsPreflightHeaders,
	appendHeader,
	appendHeaders,
	appendResponseHeader,
	appendResponseHeaders,
	assertMethod,
	callNodeListener,
	clearResponseHeaders,
	clearSession,
	createApp,
	createAppEventHandler,
	createError,
	createEvent,
	createRouter,
	defaultContentType,
	defineEventHandler,
	defineLazyEventHandler,
	defineNodeListener,
	defineNodeMiddleware,
	defineRequestMiddleware,
	defineResponseMiddleware,
	deleteCookie,
	dynamicEventHandler,
	eventHandler,
	fetchWithEvent,
	fromNodeMiddleware,
	fromPlainHandler,
	fromWebHandler,
	getCookie,
	getHeader,
	getHeaders,
	getMethod,
	getProxyRequestHeaders,
	getQuery,
	getRequestFingerprint,
	getRequestHeader,
	getRequestHeaders,
	getRequestHost,
	getRequestIP,
	getRequestPath,
	getRequestProtocol,
	getRequestURL,
	getRequestWebStream,
	getResponseHeader,
	getResponseHeaders,
	getResponseStatus,
	getResponseStatusText,
	getRouterParam,
	getRouterParams, 
	getSession,
	getValidatedQuery,
	getValidatedRouterParams,
	handleCacheHeaders,
	handleCors,
	isCorsOriginAllowed,
	isError,
	isEvent,
	isEventHandler,
	isMethod,
	isPreflightRequest,
	isStream,
	isWebResponse,
	lazyEventHandler,
	parseCookies,
	promisifyNodeListener,
	proxyRequest,
	readBody,
	readFormData,
	readMultipartFormData,
	readRawBody,
	readValidatedBody,
	removeResponseHeader,
	sanitizeStatusCode,
	sanitizeStatusMessage,
	sealSession,
	send,
	sendError,
	sendNoContent,
	sendProxy,
	sendRedirect,
	sendStream,
	sendWebResponse,
	serveStatic,
	setCookie,
	setHeader,
	setHeaders,
	setResponseHeader,
	setResponseHeaders,
	setResponseStatus,
	splitCookiesString,
	toEventHandler,
	toNodeListener,
	toPlainHandler,
	toWebHandler,
	unsealSession,
	updateSession,
	use,
	useBase,
	useSession,
	writeEarlyHints,
} from "h3";

/**
 *
 * @param {import('h3').H3Event} event
 * @param {string} key
 * @param {any} value
 */
export function setContext(event, key, value) {
	event.context[key] = value;
}

/**
 *
 * @param {import('h3').H3Event} event
 * @param {string} key
 */
export function getContext(event, key) {
	return event.context[key];
}

/**
 *
 * @param {{ onRequest?: import("h3")._RequestMiddleware | import("h3")._RequestMiddleware[]; onBeforeResponse?: import("h3")._ResponseMiddleware | import("h3")._ResponseMiddleware[] }} options
 * @returns
 */
export function defineMiddleware(options) {
	return options;
}

/**
 * The web request utils are copied from `h3` with a few bug fixes regaring multiple access to
 * `readBody` and when the body is an ArrayBuffer, such as in Deno, Edge Functions, etc.
 *
 * We intend to remove this section once this is upstreamed in h3.
 */

function toWebRequestH3(/** @type {import('h3').H3Event} */ event) {
	/**
	 * @type {ReadableStream | undefined}
	 */
	let readableStream;

	const url = getRequestURL(event);
	const base = {
		// @ts-ignore Undici option
		duplex: "half",
		method: event.method,
		headers: event.headers,
	};

	if (event.node.req.body instanceof ArrayBuffer) {
		return new Request(url, {
			...base,
			body: event.node.req.body,
		});
	}

	return new Request(url, {
		...base,
		get body() {
			if (readableStream) {
				return readableStream;
			}
			readableStream = getRequestWebStream(event);
			return readableStream;
		},
	});
}

export function toWebRequest(/** @type {import('h3').H3Event} */ event) {
	event.web ??= {
		request: toWebRequestH3(event),
		url: getRequestURL(event),
	};
	return event.web.request;
}

export {
	H3Error,
	H3Event,
	MIMES,
	appendCorsHeaders,
	appendCorsPreflightHeaders,
	appendHeader,
	appendHeaders,
	appendResponseHeader,
	appendResponseHeaders,
	assertMethod,
	callNodeListener,
	clearResponseHeaders,
	clearSession,
	createApp,
	createAppEventHandler,
	createError,
	createEvent,
	createRouter,
	defaultContentType,
	defineEventHandler,
	defineLazyEventHandler,
	defineNodeListener,
	defineNodeMiddleware,
	defineRequestMiddleware,
	defineResponseMiddleware,
	deleteCookie,
	dynamicEventHandler,
	eventHandler,
	fetchWithEvent,
	fromNodeMiddleware,
	fromPlainHandler,
	fromWebHandler,
	getCookie,
	getHeader,
	getHeaders,
	getMethod,
	getProxyRequestHeaders,
	getQuery,
	getRequestFingerprint,
	getRequestHeader,
	getRequestHeaders,
	getRequestHost,
	getRequestIP,
	getRequestPath,
	getRequestProtocol,
	getRequestURL,
	getRequestWebStream,
	getResponseHeader,
	getResponseHeaders,
	getResponseStatus,
	getResponseStatusText,
	getRouterParam,
	getRouterParams,
	getSession,
	getValidatedQuery,
	getValidatedRouterParams,
	handleCacheHeaders,
	handleCors,
	isCorsOriginAllowed,
	isError,
	isEvent,
	isEventHandler,
	isMethod,
	isPreflightRequest,
	isStream,
	isWebResponse,
	lazyEventHandler,
	parseCookies,
	promisifyNodeListener,
	proxyRequest,
	readBody,
	readFormData,
	readMultipartFormData,
	readRawBody,
	readValidatedBody,
	removeResponseHeader,
	sanitizeStatusCode,
	sanitizeStatusMessage,
	sealSession,
	send,
	sendError,
	sendNoContent,
	sendProxy,
	sendRedirect,
	sendStream,
	sendWebResponse,
	serveStatic,
	setCookie,
	setHeader,
	setHeaders,
	setResponseHeader,
	setResponseHeaders,
	setResponseStatus,
	splitCookiesString,
	toEventHandler,
	toNodeListener,
	toPlainHandler,
	toWebHandler,
	unsealSession,
	updateSession,
	use,
	useBase,
	useSession,
	writeEarlyHints,
};
