import {
	App,
	EventHandlerRequest,
	H3CorsOptions,
	H3Event,
	_RequestMiddleware,
} from "h3";
import {
	appendCorsHeaders as _appendCorsHeaders,
	appendCorsPreflightHeaders as _appendCorsPreflightHeaders,
	appendHeader as _appendHeader,
	appendHeaders as _appendHeaders,
	appendResponseHeader as _appendResponseHeader,
	appendResponseHeaders as _appendResponseHeaders,
	assertMethod as _assertMethod,
	clearSession as _clearSession,
	defaultContentType as _defaultContentType,
	deleteCookie as _deleteCookie,
	fetchWithEvent as _fetchWithEvent,
	getCookie as _getCookie,
	getHeader as _getHeader,
	getHeaders as _getHeaders,
	getProxyRequestHeaders as _getProxyRequestHeaders,
	getQuery as _getQuery,
	getRequestFingerprint as _getRequestFingerprint,
	getRequestHeader as _getRequestHeader,
	getRequestHeaders as _getRequestHeaders,
	getRequestHost as _getRequestHost,
	getRequestIP as _getRequestIP,
	getRequestProtocol as _getRequestProtocol,
	getRequestURL as _getRequestURL,
	getRequestWebStream as _getRequestWebStream,
	getResponseHeader as _getResponseHeader,
	getResponseHeaders as _getResponseHeaders,
	getResponseStatus as _getResponseStatus,
	getResponseStatusText as _getResponseStatusText,
	getRouterParam as _getRouterParam,
	getRouterParams as _getRouterParams,
	getValidatedQuery as _getValidatedQuery,
	getValidatedRouterParams as _getValidatedRouterParams,
	handleCacheHeaders as _handleCacheHeaders,
	handleCors as _handleCors,
	isCorsOriginAllowed as _isCorsOriginAllowed,
	isMethod as _isMethod,
	isPreflightRequest as _isPreflightRequest,
	parseCookies as _parseCookies,
	proxyRequest as _proxyRequest,
	readBody as _readBody,
	readFormData as _readFormData,
	readMultipartFormData as _readMultipartFormData,
	readRawBody as _readRawBody,
	readValidatedBody as _readValidatedBody,
	removeResponseHeader as _removeResponseHeader, // ... import other utilities as needed
	sanitizeStatusCode as _sanitizeStatusCode,
	sanitizeStatusMessage as _sanitizeStatusMessage,
	send as _send,
	sendError as _sendError,
	sendNoContent as _sendNoContent,
	sendProxy as _sendProxy,
	sendRedirect as _sendRedirect,
	sendStream as _sendStream,
	sendWebResponse as _sendWebResponse,
	setCookie as _setCookie,
	setHeader as _setHeader,
	setHeaders as _setHeaders,
	setResponseHeader as _setResponseHeader,
	setResponseHeaders as _setResponseHeaders,
	setResponseStatus as _setResponseStatus,
	splitCookiesString as _splitCookiesString,
	unsealSession as _unsealSession,
	useBase as _useBase,
	writeEarlyHints as _writeEarlyHints,
} from "h3";

export type HTTPEvent = H3Event;
export type HTTPServer = App;

export {
	H3Error,
	H3Event,
	MIMES,
	callNodeListener,
	clearResponseHeaders,
	createApp,
	createApp as createServer,
	createAppEventHandler,
	createEvent,
	createRouter,
	defineEventHandler,
	defineLazyEventHandler,
	defineNodeListener,
	defineNodeMiddleware,
	defineRequestMiddleware,
	defineResponseMiddleware,
	dynamicEventHandler,
	eventHandler,
	fromNodeMiddleware,
	fromPlainHandler,
	fromWebHandler,
	isError,
	isEvent,
	isEventHandler,
	isWebResponse,
	lazyEventHandler,
	promisifyNodeListener,
	serveStatic,
	toEventHandler,
	toNodeListener,
	toPlainHandler,
	toWebHandler,
	isCorsOriginAllowed,
	isMethod,
	isPreflightRequest,
	isStream,
	createError,
	sanitizeStatusCode,
	sanitizeStatusMessage,
} from "h3";

export function getContext(event: HTTPEvent, key: string): any;
export function getContext(key: string): any;

export function setContext(event: HTTPEvent, key: string, value: any): any;
export function setContext(key: string, value: any): any;

export function appendCorsHeaders(
	event: HTTPEvent,
	options: H3CorsOptions,
): void;
export function appendCorsHeaders(options: H3CorsOptions): void;

export function appendCorsPreflightHeaders(
	event: HTTPEvent,
	options: H3CorsOptions,
): void;
export function appendCorsPreflightHeaders(options: H3CorsOptions): void;

export function appendHeader(
	event: HTTPEvent,
	key: string,
	value: string,
): void;
export function appendHeader(key: string, value: string): void;

export function appendHeaders(
	event: HTTPEvent,
	headers: Record<string, string>,
): void;
export function appendHeaders(headers: Record<string, string>): void;

export function appendResponseHeader(
	event: HTTPEvent,
	key: string,
	value: string,
): void;
export function appendResponseHeader(key: string, value: string): void;

export function appendResponseHeaders(
	event: HTTPEvent,
	headers: Record<string, string>,
): void;
export function appendResponseHeaders(headers: Record<string, string>): void;

export function assertMethod(event: HTTPEvent, method: string): void;
export function assertMethod(method: string): void;

export function clearSession(event: HTTPEvent): void;
export function clearSession(): void;

export function defaultContentType(event: HTTPEvent, type: string): void;
export function defaultContentType(type: string): void;

export function deleteCookie(event: HTTPEvent, name: string): void;
export function deleteCookie(name: string): void;

export function fetchWithEvent(
	event: HTTPEvent,
	input: RequestInfo,
	init?: RequestInit,
): Promise<Response>;
export function fetchWithEvent(
	input: RequestInfo,
	init?: RequestInit,
): Promise<Response>;

export function getCookie(event: HTTPEvent, name: string): string | undefined;
export function getCookie(name: string): string | undefined;

export function getHeader(event: HTTPEvent, key: string): string | undefined;
export function getHeader(key: string): string | undefined;

export function getHeaders(event: HTTPEvent): Record<string, string>;
export function getHeaders(): Record<string, string>;

export function getProxyRequestHeaders(
	event: HTTPEvent,
): Record<string, string>;
export function getProxyRequestHeaders(): Record<string, string>;

export function getQuery(event: HTTPEvent): Record<string, string>;
export function getQuery(): Record<string, string>;

export function getRequestFingerprint(event: HTTPEvent): string;
export function getRequestFingerprint(): string;

export function getRequestHeader(event: HTTPEvent, key: string): string;
export function getRequestHeader(key: string): string;

export function getRequestHeaders(event: HTTPEvent): Record<string, string>;
export function getRequestHeaders(): Record<string, string>;

export function getRequestHost(event: HTTPEvent): string;
export function getRequestHost(): string;

export function getRequestIP(event: HTTPEvent): string;
export function getRequestIP(): string;

export function getRequestProtocol(event: HTTPEvent): string;
export function getRequestProtocol(): string;

export function getRequestURL(event: HTTPEvent): string;
export function getRequestURL(): string;

export function getRequestWebStream(event: HTTPEvent): ReadableStream;
export function getRequestWebStream(): ReadableStream;

export function getResponseHeader(event: HTTPEvent, key: string): string;
export function getResponseHeader(key: string): string;

export function getResponseHeaders(event: HTTPEvent): Record<string, string>;
export function getResponseHeaders(): Record<string, string>;

export function getResponseStatus(event: HTTPEvent): number;
export function getResponseStatus(): number;

export function defineMiddleware(options: {
	onRequest?:
		| import("h3")._RequestMiddleware
		| import("h3")._RequestMiddleware[];
	onBeforeResponse?:
		| import("h3")._ResponseMiddleware
		| import("h3")._ResponseMiddleware[];
}): {
	onRequest?:
		| import("h3")._RequestMiddleware
		| import("h3")._RequestMiddleware[]
		| undefined;
	onBeforeResponse?:
		| import("h3")._ResponseMiddleware
		| import("h3")._ResponseMiddleware[]
		| undefined;
};
