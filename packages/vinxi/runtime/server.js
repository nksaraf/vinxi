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
	getRouterParams, // getSession,
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
	sanitizeStatusMessage, // sealSession,
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
	unsealSession, // updateSession,
	use,
	useBase, // useSession,
	writeEarlyHints,
} from "h3";
import { seal, defaults as sealDefaults } from "iron-webcrypto";
import crypto from "uncrypto";

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

/**
 * The session utils are copied from `h3` with a few bug fixe regaring locking when sealing happens
 * so things dont get stuck.
 *
 * We intend to remove this section once this is upstreamed in h3.
 *
 */

const DEFAULT_NAME = "h3";
const DEFAULT_COOKIE = {
	path: "/",
	secure: true,
	httpOnly: true,
};

export async function useSession(
	/** @type {import('h3').H3Event} */ event,
	/** @type {import('h3').SessionConfig} */ config,
) {
	// Create a synced wrapper around the session
	const sessionName = config.name || DEFAULT_NAME;
	await getSession(event, config); // Force init

	/** @type {Awaited<ReturnType<import('h3')['useSession']>>} */
	const sessionManager = {
		get id() {
			return event.context.sessions?.[sessionName]?.id;
		},
		get data() {
			return event.context.sessions?.[sessionName]?.data || {};
		},
		update: async (update) => {
			await updateSession(event, config, update);
			return sessionManager;
		},
		clear: async () => {
			await clearSession(event, config);
			return sessionManager;
		},
	};
	return sessionManager;
}

export async function getSession(
	/** @type {import('h3').H3Event} */ event,
	/** @type {import('h3').SessionConfig} */ config,
) {
	const sessionName = config.name || DEFAULT_NAME;
	// Return existing session if available
	if (!event.context.sessions) {
		event.context.sessions = Object.create(null);
	}
	if (!event.context.sessionLocks) {
		event.context.sessionLocks = Object.create(null);
	}
	// Wait for existing session to load
	if (event.context.sessionLocks[sessionName]) {
		await event.context.sessionLocks[sessionName];
	}
	if (event.context.sessions[sessionName]) {
		return event.context.sessions[sessionName];
	}
	// Prepare an empty session object and store in context
	const session = {
		id: "",
		createdAt: 0,
		data: Object.create(null),
	};
	event.context.sessions[sessionName] = session;
	// Try to load session
	let sealedSession;
	// Try header first
	if (config.sessionHeader !== false) {
		const headerName =
			typeof config.sessionHeader === "string"
				? config.sessionHeader.toLowerCase()
				: `x-${sessionName.toLowerCase()}-session`;
		const headerValue = event.node.req.headers[headerName];
		if (typeof headerValue === "string") {
			sealedSession = headerValue;
		}
	}
	// Fallback to cookies
	if (!sealedSession) {
		sealedSession = getCookie(event, sessionName);
	}
	if (sealedSession) {
		// Unseal session data from cookie
		const lock = unsealSession(event, config, sealedSession)
			.catch(() => {})
			.then((unsealed) => {
				Object.assign(session, unsealed);
				// make sure deletion occurs before promise resolves
				delete event.context.sessionLocks[sessionName];
			});

		event.context.sessionLocks[sessionName] = lock;
		await lock;
	}
	// New session store in response cookies
	if (!session.id) {
		session.id =
			config.generateId?.() ?? (config.crypto || crypto).randomUUID();
		session.createdAt = Date.now();
		await updateSession(event, config);
	}
	return session;
}

export async function updateSession(
	/** @type {import('h3').H3Event} */ event,
	/** @type {import('h3').SessionConfig} */ config,
	update,
) {
	const sessionName = config.name || DEFAULT_NAME;
	// Access current session
	const session =
		event.context.sessions?.[sessionName] || (await getSession(event, config));
	// Update session data if provided
	if (typeof update === "function") {
		update = update(session.data);
	}
	if (update) {
		Object.assign(session.data, update);
	}
	// Seal and store in cookie
	if (config.cookie !== false) {
		const sealed = await sealSession(event, config);
		setCookie(event, sessionName, sealed, {
			...DEFAULT_COOKIE,
			expires: config.maxAge
				? new Date(session.createdAt + config.maxAge * 1000)
				: undefined,
			...config.cookie,
		});
	}
	return session;
}

export async function sealSession(
	/** @type {import('h3').H3Event} */ event,
	/** @type {import('h3').SessionConfig} */ config,
) {
	const sessionName = config.name || DEFAULT_NAME;
	// Access current session
	const session =
		event.context.sessions?.[sessionName] || (await getSession(event, config));
	const sealed = await seal(config.crypto || crypto, session, config.password, {
		...sealDefaults,
		ttl: config.maxAge ? config.maxAge * 1000 : 0,
		...config.seal,
	});
	return sealed;
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
	// getSession,
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
	// sealSession,
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
	// updateSession,
	use,
	useBase,
	// useSession,
	writeEarlyHints,
};
