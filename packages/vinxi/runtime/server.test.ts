import { assert, describe, expect, it } from "vitest";

import {
	type AddRouteShortcuts,
	type App,
	type AppOptions,
	type AppUse,
	type CacheConditions,
	type CreateRouterOptions,
	type Duplex,
	type DynamicEventHandler,
	type Encoding,
	type EventHandler,
	type EventHandlerObject,
	type EventHandlerRequest,
	type EventHandlerResponse,
	type H3CorsOptions,
	H3Error,
	H3Event,
	type H3EventContext,
	H3Headers,
	H3Response,
	HTTPEventSymbol,
	type HTTPHeaderName,
	type HTTPMethod,
	type InferEventInput,
	type InputLayer,
	type InputStack,
	type Layer,
	type LazyEventHandler,
	MIMES,
	type Matcher,
	type MultiPartData,
	type NodeEventContext,
	type NodeListener,
	type NodeMiddleware,
	type NodePromisifiedHandler,
	type PlainHandler,
	type PlainRequest,
	type PlainResponse,
	type ProxyOptions,
	type RequestFingerprintOptions,
	type RequestHeaders,
	type RouteNode,
	type Router,
	type RouterMethod,
	type RouterUse,
	type ServeStaticOptions,
	type Session,
	type SessionConfig,
	type SessionData,
	type Stack,
	type StaticAssetMeta,
	type ValidateFunction,
	type ValidateResult,
	type WebEventContext,
	type WebHandler,
	type _RequestMiddleware,
	type _ResponseMiddleware,
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
	getProxyRequestHeaders,
	getQuery,
	getRequestFingerprint,
	getRequestHeader,
	getRequestHeaders,
	getRequestHost,
	getRequestIP,
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
	getWebRequest,
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
	toWebRequest,
	unsealSession,
	updateSession,
	useSession,
	writeEarlyHints,
} from "./server";

describe("server", () => {
	it("should export all types", () => {
		console.log(proxyRequest);
		expect(appendCorsHeaders).not.toBeUndefined();
		expect(appendCorsPreflightHeaders).not.toBeUndefined();
		expect(appendHeader).not.toBeUndefined();
		expect(appendHeaders).not.toBeUndefined();
		expect(appendResponseHeader).not.toBeUndefined();
		expect(appendResponseHeaders).not.toBeUndefined();
		expect(assertMethod).not.toBeUndefined();
		expect(callNodeListener).not.toBeUndefined();
		expect(clearResponseHeaders).not.toBeUndefined();
		expect(clearSession).not.toBeUndefined();
		expect(createApp).not.toBeUndefined();
		expect(createAppEventHandler).not.toBeUndefined();
		expect(createError).not.toBeUndefined();
		expect(createEvent).not.toBeUndefined();
		expect(createRouter).not.toBeUndefined();
		expect(defaultContentType).not.toBeUndefined();
		expect(defineEventHandler).not.toBeUndefined();
		expect(defineLazyEventHandler).not.toBeUndefined();
		expect(defineNodeListener).not.toBeUndefined();
		expect(defineNodeMiddleware).not.toBeUndefined();
		expect(defineRequestMiddleware).not.toBeUndefined();
		expect(defineResponseMiddleware).not.toBeUndefined();
		expect(deleteCookie).not.toBeUndefined();
		expect(dynamicEventHandler).not.toBeUndefined();
		expect(eventHandler).not.toBeUndefined();
		expect(fetchWithEvent).not.toBeUndefined();
		expect(fromNodeMiddleware).not.toBeUndefined();
		expect(fromPlainHandler).not.toBeUndefined();
		expect(fromWebHandler).not.toBeUndefined();
		expect(getCookie).not.toBeUndefined();
		expect(getHeader).not.toBeUndefined();
		expect(getHeaders).not.toBeUndefined();
		expect(getProxyRequestHeaders).not.toBeUndefined();
		expect(getQuery).not.toBeUndefined();
		expect(getRequestFingerprint).not.toBeUndefined();
		expect(getRequestHeader).not.toBeUndefined();
		expect(getRequestHeaders).not.toBeUndefined();
		expect(getRequestHost).not.toBeUndefined();
		expect(getRequestIP).not.toBeUndefined();
		expect(getRequestProtocol).not.toBeUndefined();
		expect(getRequestURL).not.toBeUndefined();
		expect(getRequestWebStream).not.toBeUndefined();
		expect(getResponseHeader).not.toBeUndefined();
		expect(getResponseHeaders).not.toBeUndefined();
		expect(getResponseStatus).not.toBeUndefined();
		expect(getResponseStatusText).not.toBeUndefined();
		expect(getRouterParam).not.toBeUndefined();
		expect(getRouterParams).not.toBeUndefined();
		expect(getSession).not.toBeUndefined();
		expect(getValidatedQuery).not.toBeUndefined();
		expect(getValidatedRouterParams).not.toBeUndefined();
		expect(handleCacheHeaders).not.toBeUndefined();
		expect(handleCors).not.toBeUndefined();
		expect(isCorsOriginAllowed).not.toBeUndefined();
		expect(isError).not.toBeUndefined();
		expect(isEvent).not.toBeUndefined();
		expect(isEventHandler).not.toBeUndefined();
		expect(isMethod).not.toBeUndefined();
		expect(isPreflightRequest).not.toBeUndefined();
		expect(isStream).not.toBeUndefined();
		expect(isWebResponse).not.toBeUndefined();
		expect(lazyEventHandler).not.toBeUndefined();
		expect(parseCookies).not.toBeUndefined();
		expect(promisifyNodeListener).not.toBeUndefined();
		expect(proxyRequest).not.toBeUndefined();
		expect(readBody).not.toBeUndefined();
		expect(readFormData).not.toBeUndefined();
		expect(readMultipartFormData).not.toBeUndefined();
		expect(readRawBody).not.toBeUndefined();
		expect(readValidatedBody).not.toBeUndefined();
		expect(removeResponseHeader).not.toBeUndefined();
		expect(sanitizeStatusCode).not.toBeUndefined();
		expect(sanitizeStatusMessage).not.toBeUndefined();
		expect(sealSession).not.toBeUndefined();
		expect(send).not.toBeUndefined();
		expect(sendError).not.toBeUndefined();
		expect(sendNoContent).not.toBeUndefined();
		expect(sendProxy).not.toBeUndefined();
		expect(sendRedirect).not.toBeUndefined();
		expect(sendStream).not.toBeUndefined();
		expect(sendWebResponse).not.toBeUndefined();
		expect(serveStatic).not.toBeUndefined();
		expect(setCookie).not.toBeUndefined();
		expect(setHeader).not.toBeUndefined();
		expect(setHeaders).not.toBeUndefined();
		expect(setResponseHeader).not.toBeUndefined();
		expect(setResponseHeaders).not.toBeUndefined();
		expect(setResponseStatus).not.toBeUndefined();
		expect(splitCookiesString).not.toBeUndefined();
		expect(toEventHandler).not.toBeUndefined();
		expect(toNodeListener).not.toBeUndefined();
		expect(toPlainHandler).not.toBeUndefined();
		expect(toWebHandler).not.toBeUndefined();
		expect(toWebRequest).not.toBeUndefined();
		expect(unsealSession).not.toBeUndefined();
		expect(updateSession).not.toBeUndefined();
		expect(useSession).not.toBeUndefined();
		expect(writeEarlyHints).not.toBeUndefined();
		expect(getWebRequest).not.toBeUndefined();
		expect(HTTPEventSymbol).not.toBeUndefined();
	});
});
