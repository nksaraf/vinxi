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
	parseCookies as _parseCookies,
	proxyRequest as _proxyRequest,
	readBody as _readBody,
	readFormData as _readFormData,
	readMultipartFormData as _readMultipartFormData,
	readRawBody as _readRawBody,
	readValidatedBody as _readValidatedBody,
	removeResponseHeader as _removeResponseHeader, // ... import other utilities as needed
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
	writeEarlyHints as _writeEarlyHints,
} from "h3";
import { CacheOptions } from "nitropack";

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
	type H3EventContext,
	H3Headers,
	H3Response,
	type HTTPHeaderName,
	type HTTPMethod,
	type InferEventInput,
	type InputLayer,
	type InputStack,
	type Layer,
	type LazyEventHandler,
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

export function getResponseStatusText(event: HTTPEvent): string;
export function getResponseStatusText(): string;

export function getRouterParam(event: HTTPEvent, name: string): string;
export function getRouterParam(name: string): string;

export function getRouterParams(event: HTTPEvent): Record<string, string>;
export function getRouterParams(): Record<string, string>;

export function getValidatedQuery(
	event: HTTPEvent,
	schema: Record<string, any>,
): Record<string, any>;
export function getValidatedQuery(
	schema: Record<string, any>,
): Record<string, any>;

export function getValidatedRouterParams(
	event: HTTPEvent,
	schema: Record<string, any>,
): Record<string, any>;
export function getValidatedRouterParams(
	schema: Record<string, any>,
): Record<string, any>;

export function handleCacheHeaders(
	event: HTTPEvent,
	options: CacheOptions,
): void;
export function handleCacheHeaders(options: CacheOptions): void;

export function handleCors(event: HTTPEvent, options: H3CorsOptions): void;
export function handleCors(options: H3CorsOptions): void;

export function parseCookies(event: HTTPEvent): Record<string, string>;
export function parseCookies(): Record<string, string>;

export function proxyRequest(event: HTTPEvent, url: string): Promise<Response>;
export function proxyRequest(url: string): Promise<Response>;

export function readBody(event: HTTPEvent): Promise<string>;
export function readBody(): Promise<string>;

export function readFormData(event: HTTPEvent): Promise<FormData>;
export function readFormData(): Promise<FormData>;

export function readMultipartFormData(event: HTTPEvent): Promise<FormData>;
export function readMultipartFormData(): Promise<FormData>;

export function readRawBody(event: HTTPEvent): Promise<Uint8Array>;
export function readRawBody(): Promise<Uint8Array>;

export function readValidatedBody(
	event: HTTPEvent,
	schema: Record<string, any>,
): Promise<Record<string, any>>;
export function readValidatedBody(
	schema: Record<string, any>,
): Promise<Record<string, any>>;

export function removeResponseHeader(event: HTTPEvent, key: string): void;
export function removeResponseHeader(key: string): void;

export function send(event: HTTPEvent, body: any): void;
export function send(body: any): void;

export function sendError(event: HTTPEvent, error: Error): void;
export function sendError(error: Error): void;

export function sendNoContent(event: HTTPEvent): void;
export function sendNoContent(): void;

export function sendProxy(event: HTTPEvent, url: string): void;
export function sendProxy(url: string): void;

export function sendRedirect(event: HTTPEvent, url: string): void;
export function sendRedirect(url: string): void;

export function sendStream(event: HTTPEvent, stream: ReadableStream): void;
export function sendStream(stream: ReadableStream): void;

export function sendWebResponse(event: HTTPEvent, response: Response): void;
export function sendWebResponse(response: Response): void;

export function setCookie(
	event: HTTPEvent,
	name: string,
	value: string,
	options?: {
		domain?: string;
		expires?: Date;
		httpOnly?: boolean;
		maxAge?: number;
		path?: string;
		sameSite?: "lax" | "strict";
		secure?: boolean;
	},
): void;
export function setCookie(
	name: string,
	value: string,
	options?: {
		domain?: string;
		expires?: Date;
		httpOnly?: boolean;
		maxAge?: number;
		path?: string;
		sameSite?: "lax" | "strict";
		secure?: boolean;
	},
): void;

export function setHeader(event: HTTPEvent, key: string, value: string): void;
export function setHeader(key: string, value: string): void;

export function setHeaders(
	event: HTTPEvent,
	headers: Record<string, string>,
): void;
export function setHeaders(headers: Record<string, string>): void;

export function setResponseHeader(
	event: HTTPEvent,
	key: string,
	value: string,
): void;
export function setResponseHeader(key: string, value: string): void;

export function setResponseHeaders(
	event: HTTPEvent,
	headers: Record<string, string>,
): void;
export function setResponseHeaders(headers: Record<string, string>): void;

export function setResponseStatus(event: HTTPEvent, status: number): void;
export function setResponseStatus(status: number): void;

export function splitCookiesString(cookies: string): Record<string, string>;
export function splitCookiesString(): Record<string, string>;

export function unsealSession(event: HTTPEvent): void;
export function unsealSession(): void;

export function writeEarlyHints(
	event: HTTPEvent,
	headers: Record<string, string>,
): void;
export function writeEarlyHints(headers: Record<string, string>): void;

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

export function getEvent(): HTTPEvent;
