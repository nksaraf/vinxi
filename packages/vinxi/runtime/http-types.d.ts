/**
 * @license MIT
 * Copyright (c) Pooya Parsa <pooya@pi0.io>. 
 * 
 * All the types in this file are copied from h3 package. We add a variant without the `event` parameter that uses AsyncLocalStorage.
 */

import {
	App,
	H3CorsOptions,
	H3EventContext,
	H3Event,
	HTTPMethod,
	RequestFingerprintOptions,
	Session,
	SessionConfig,
	SessionData,
	_RequestMiddleware,
	H3Error,
	EventHandler,
	Encoding,
	InferEventInput,
	ValidateFunction,
	CacheConditions,
	ProxyOptions,
	HTTPHeaderName,
	RequestHeaders,
	MultiPartData,
} from "h3";
import { CookieSerializeOptions } from 'cookie-es';
import { OutgoingMessage } from "node:http";
import { Readable } from "node:stream";
export type HTTPServer = App;

export { CookieSerializeOptions } from 'cookie-es';

export {
	H3Error,
	H3Event,
	MIMES,
	callNodeListener,
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
	defineWebSocket,
	promisifyNodeListener,
	serveStatic,
	toEventHandler,
	toNodeListener,
	toPlainHandler,
	toWebHandler,
	isCorsOriginAllowed,
	isStream,
	toWebRequest,
	createError,
	splitCookiesString,
	sanitizeStatusCode,
	sanitizeStatusMessage,
	useBase,
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

export type HTTPEvent = H3Event;

/**
 * Checks if the input is an HTTPEvent object.
 * @param input - The input to check.
 * @returns True if the input is an HTTPEvent object, false otherwise.
 * @see HTTPEvent
 */
export function isHTTPEvent(input: any): input is HTTPEvent;

type SessionDataT = Record<string, any>;
type SessionUpdate<T extends SessionDataT = SessionDataT> =
	| Partial<SessionData<T>>
	| ((oldData: SessionData<T>) => Partial<SessionData<T>> | undefined);


/*****************************************************
 * Read Body Utilities
 *****************************************************/

/**
 * Reads body of the request and returns encoded raw string (default), or `Buffer` if encoding is falsy.
 * @param event {HTTPEvent} H3 event or req passed by h3 handler
 * @param encoding {Encoding} encoding="utf-8" - The character encoding to use.
 *
 * @return {String|Buffer} Encoded raw string or raw Buffer of the body
 */
export function readRawBody<E extends Encoding = "utf8">(
	event: HTTPEvent,
	encoding?: E,
): E extends false ? Promise<Buffer | undefined> : Promise<string | undefined>;
export function readRawBody<E extends Encoding = "utf8">(
	encoding?: E,
): E extends false ? Promise<Buffer | undefined> : Promise<string | undefined>;

/**
 * Reads request body and tries to safely parse using [destr](https://github.com/unjs/destr).
 * @param event H3 event passed by h3 handler
 * @param encoding The character encoding to use, defaults to 'utf-8'.
 *
 * @return {*} The `Object`, `Array`, `String`, `Number`, `Boolean`, or `null` value corresponding to the request JSON body
 *
 * ```ts
 * const body = await readBody(event)
 * ```
 */
export function readBody<
	T,
	Event extends HTTPEvent = HTTPEvent,
	_T = InferEventInput<"body", Event, T>,
>(
	event: Event,
	options?: {
		strict?: boolean;
	},
): Promise<_T>;
export function readBody<
	T,
	Event extends HTTPEvent = HTTPEvent,
	_T = InferEventInput<"body", Event, T>,
>(
	options?: {
		strict?: boolean;
	},
): Promise<_T>;

/**
 * Tries to read the request body via `readBody`, then uses the provided validation function and either throws a validation error or returns the result.
 * @param event The HTTPEvent passed by the handler.
 * @param validate The function to use for body validation. It will be called passing the read request body. If the result is not false, the parsed body will be returned.
 * @throws If the validation function returns `false` or throws, a validation error will be thrown.
 * @return {*} The `Object`, `Array`, `String`, `Number`, `Boolean`, or `null` value corresponding to the request JSON body.
 * @see {readBody}
 *
 * ```ts
 * // With a custom validation function
 * const body = await readValidatedBody(event, (body) => {
 *   return typeof body === "object" && body !== null
 * })
 *
 * // With a zod schema
 * import { z } from 'zod'
 * const objectSchema = z.object()
 * const body = await readValidatedBody(event, objectSchema.safeParse)
 * ```
 */
export function readValidatedBody<
	T,
	Event extends HTTPEvent = HTTPEvent,
	_T = InferEventInput<"body", Event, T>,
>(event: Event, validate: ValidateFunction<_T>): Promise<_T>;
export function readValidatedBody<
	T,
	Event extends HTTPEvent = HTTPEvent,
	_T = InferEventInput<"body", Event, T>,
	>(validate: ValidateFunction<_T>): Promise<_T>;


/**
 * Tries to read and parse the body of a an HTTPEvent as multipart form.
 * @param event The HTTPEvent object to read multipart form from.
 *
 * @return The parsed form data. If no form could be detected because the content type is not multipart/form-data or no boundary could be found.
 *
 * ```ts
 * const formData = await readMultipartFormData(event)
 * // The result could look like:
 * // [
 * //   {
 * //     "data": "other",
 * //     "name": "baz",
 * //   },
 * //   {
 * //     "data": "something",
 * //     "name": "some-other-data",
 * //   },
 * // ]
 * ```
 */
export function readMultipartFormData(
	event: HTTPEvent,
): Promise<MultiPartData[] | undefined>;
export function readMultipartFormData(): Promise<
	MultiPartData[] | undefined
>;

/**
 * Constructs a FormData object from an event, after converting it to a a web request.
 * @param event The HTTPEvent object to read the form data from.
 *
 * ```ts
 * const eventHandler = event => {
 *   const formData = await readFormData(event)
 *   const email = formData.get("email")
 *   const password = formData.get("password")
 *  }
 * ```
 */
export function readFormData(event: HTTPEvent): Promise<FormData>;
export function readFormData(): Promise<FormData>;


/**
 * Captures a stream from a request.
 * @param event The HTTPEvent object containing the request information.
 * @returns Undefined if the request can't transport a payload, otherwise a ReadableStream of the request body.
 */
export function getRequestWebStream(
	event: HTTPEvent,
): undefined | ReadableStream;
export function getRequestWebStream(): undefined | ReadableStream;


/*****************************************************
 * Request Info Utilities
 *****************************************************/


export function getRequestHost(
	event: HTTPEvent,
	opts?: {
		xForwardedHost?: boolean;
	},
): string;
export function getRequestHost(
	opts?: {
		xForwardedHost?: boolean;
	},
): string;

export function getRequestProtocol(
	event: HTTPEvent,
	opts?: {
		xForwardedProto?: boolean;
	},
): "https" | "http";
export function getRequestProtocol(): "https" | "http";

export function getRequestURL(
	event: HTTPEvent,
	opts?: {
		xForwardedHost?: boolean;
		xForwardedProto?: boolean;
	},
): URL;
export function getRequestURL(
	opts?: {
		xForwardedHost?: boolean;
		xForwardedProto?: boolean;
	},
): URL;

export function getRequestIP(
	event: HTTPEvent,
	opts?: {
		/**
		 * Use the X-Forwarded-For HTTP header set by proxies.
		 *
		 * Note: Make sure that this header can be trusted (your application running behind a CDN or reverse proxy) before enabling.
		 */
		xForwardedFor?: boolean;
	},
): string | undefined;
export function getRequestIP(): string | undefined;


/*****************************************************
 * Request Type Utilities
 *****************************************************/

export function isPreflightRequest(event: HTTPEvent): boolean;
export function isPreflightRequest(): boolean;


/*****************************************************
 * Web Request Utilities
 *****************************************************/

export function getWebRequest(event: HTTPEvent): Request;
export function getWebRequest(): Request;

/*****************************************************
 * Cookie Utilities
 *****************************************************/

/**
 * Parse the request to get HTTP Cookie header string and returning an object of all cookie name-value pairs.
 * @param event {HTTPEvent} H3 event or req passed by h3 handler
 * @returns Object of cookie name-value pairs
 * ```ts
 * const cookies = parseCookies(event)
 * ```
 */
export function parseCookies(event: HTTPEvent): Record<string, string>;
export function parseCookies(): Record<string, string>;

/**
 * Get a cookie value by name.
 * @param event {HTTPEvent} H3 event or req passed by h3 handler
 * @param name Name of the cookie to get
 * @returns {*} Value of the cookie (String or undefined)
 * ```ts
 * const authorization = getCookie(request, 'Authorization')
 * ```
 */
export function getCookie(event: HTTPEvent, name: string): string | undefined;
export function getCookie(name: string): string | undefined;

/**
 * Set a cookie value by name.
 * @param event {HTTPEvent} H3 event or res passed by h3 handler
 * @param name Name of the cookie to set
 * @param value Value of the cookie to set
 * @param serializeOptions {CookieSerializeOptions} Options for serializing the cookie
 * ```ts
 * setCookie(res, 'Authorization', '1234567')
 * ```
 */
export function setCookie(
	event: HTTPEvent,
	name: string,
	value: string,
	serializeOptions?: CookieSerializeOptions,
): void;
export function setCookie(
	name: string,
	value: string,
	serializeOptions?: CookieSerializeOptions,
): void;

/**
 * Remove a cookie by name.
 * @param event {HTTPEvent} H3 event or res passed by h3 handler
 * @param name Name of the cookie to delete
 * @param serializeOptions {CookieSerializeOptions} Cookie options
 * ```ts
 * deleteCookie(res, 'SessionId')
 * ```
 */
export function deleteCookie(
	event: HTTPEvent,
	name: string,
	serializeOptions?: CookieSerializeOptions,
): void;
export function deleteCookie(
	name: string,
	serializeOptions?: CookieSerializeOptions,
): void;

/** @experimental Behavior of this utility might change in the future versions */
export function getRequestFingerprint(
	event: HTTPEvent,
	opts?: RequestFingerprintOptions,
): Promise<string | null>;
export function getRequestFingerprint(
	opts?: RequestFingerprintOptions,
): Promise<string | null>;


/*****************************************************
 * Fetch Utilities
 *****************************************************/

export function fetchWithEvent<
	T = unknown,
	_R = any,
	F extends (req: RequestInfo | URL, opts?: any) => any = typeof fetch,
>(
	event: HTTPEvent,
	req: RequestInfo | URL,
	init?: RequestInit & {
		context?: H3EventContext;
	},
	options?: {
		fetch: F;
	},
): unknown extends T ? ReturnType<F> : T;
export function fetchWithEvent<
	T = unknown,
	_R = any,
	F extends (req: RequestInfo | URL, opts?: any) => any = typeof fetch,
>(
	req: RequestInfo | URL,
	init?: RequestInit & {
		context?: H3EventContext;
	},
	options?: {
		fetch: F;
	},
): unknown extends T ? ReturnType<F> : T;


/*****************************************************
 * Router Param Utilities
 *****************************************************/



export function getRouterParams(
	event: HTTPEvent,
	opts?: {
		decode?: boolean;
	},
): NonNullable<HTTPEvent["context"]["params"]>;
export function getRouterParams(
	opts?: {
		decode?: boolean;
	},
): NonNullable<HTTPEvent["context"]["params"]>;

export function getValidatedRouterParams<
	T,
	Event extends HTTPEvent = HTTPEvent,
	_T = InferEventInput<"routerParams", Event, T>,
>(
	event: Event,
	validate: ValidateFunction<_T>,
	opts?: {
		decode?: boolean;
	},
): Promise<_T>;
export function getValidatedRouterParams<
	T,
	Event extends HTTPEvent = HTTPEvent,
	_T = InferEventInput<"routerParams", Event, T>,
>(
	validate: ValidateFunction<_T>,
	opts?: {
		decode?: boolean;
	},
): Promise<_T>;

export function getRouterParam(
	event: HTTPEvent,
	name: string,
	opts?: {
		decode?: boolean;
	},
): string | undefined;
export function getRouterParam(
	name: string,
	opts?: {
		decode?: boolean;
	},
): string | undefined;





/*****************************************************
 * Query Utilities
 *****************************************************/

export function getQuery<
	T,
	Event extends HTTPEvent = HTTPEvent,
	_T = Exclude<InferEventInput<"query", Event, T>, undefined>,
>(event: Event): _T;
export function getQuery<
	T,
	Event extends HTTPEvent = HTTPEvent,
	_T = Exclude<InferEventInput<"query", Event, T>, undefined>,
>(): _T;

export function getValidatedQuery<
	T,
	Event extends HTTPEvent = HTTPEvent,
	_T = InferEventInput<"query", Event, T>,
>(event: Event, validate: ValidateFunction<_T>): Promise<_T>;
export function getValidatedQuery<
	T,
	Event extends HTTPEvent = HTTPEvent,
	_T = InferEventInput<"query", Event, T>,
>(validate: ValidateFunction<_T>): Promise<_T>;

/*****************************************************
 * Session Utilities
 *****************************************************/

export function clearSession(
	event: HTTPEvent,
	config: Partial<SessionConfig>,
): Promise<void>;
export function clearSession(config: Partial<SessionConfig>): Promise<void>;

export function unsealSession(
	event: HTTPEvent,
	config: SessionConfig,
	sealed: string,
): Promise<Partial<Session<SessionDataT>>>;
export function unsealSession(
	config: SessionConfig,
	sealed: string,
): Promise<Partial<Session<SessionDataT>>>;

export function getSession<T extends SessionDataT = SessionDataT>(
	event: HTTPEvent,
	config: SessionConfig,
): Promise<Session<T>>;
export function getSession<T extends SessionDataT = SessionDataT>(
	config: SessionConfig,
): Promise<Session<T>>;

export function sealSession(event: HTTPEvent, config: SessionConfig): void;
export function sealSession(config: SessionConfig): void;

export function updateSession<T extends SessionDataT = SessionDataT>(
	event: HTTPEvent,
	config: SessionConfig,
	update?: SessionUpdate<T>,
): Promise<Session<T>>;
export function updateSession<T extends SessionDataT = SessionDataT>(
	config: SessionConfig,
	update?: SessionUpdate<T>,
): Promise<Session<T>>;

export function useSession<T extends SessionDataT = SessionDataT>(
	event: HTTPEvent,
	config: SessionConfig,
): Promise<{
	readonly id: string | undefined;
	readonly data: T;
	update: (update: SessionUpdate<T>) => Promise<any>;
	clear: () => Promise<any>;
}>;
export function useSession<T extends SessionDataT = SessionDataT>(
	config: SessionConfig,
): Promise<{
	readonly id: string | undefined;
	readonly data: T;
	update: (update: SessionUpdate<T>) => Promise<any>;
	clear: () => Promise<any>;
}>;


/*****************************************************
 * Header Utilities
 *****************************************************/

export function getResponseHeaders(
	event: HTTPEvent,
): ReturnType<HTTPEvent["res"]["getHeaders"]>;
export function getResponseHeaders(): ReturnType<HTTPEvent["res"]["getHeaders"]>;


export function getResponseHeader(
	event: HTTPEvent,
	name: HTTPHeaderName,
): ReturnType<HTTPEvent["res"]["getHeader"]>;
export function getResponseHeader(
	name: HTTPHeaderName,
): ReturnType<HTTPEvent["res"]["getHeader"]>;

export function setResponseHeaders(
	event: HTTPEvent,
	headers: Partial<Record<HTTPHeaderName, Parameters<OutgoingMessage["setHeader"]>[1]>>,
): void;
export function setResponseHeaders(
	headers: Partial<Record<HTTPHeaderName, Parameters<OutgoingMessage["setHeader"]>[1]>>,
): void;

export const setHeaders: typeof setResponseHeaders;


export function setResponseHeader(
	event: HTTPEvent,
	name: HTTPHeaderName,
	value: Parameters<OutgoingMessage["setHeader"]>[1],
): void;
export function setResponseHeader(
	name: HTTPHeaderName,
	value: Parameters<OutgoingMessage["setHeader"]>[1],
): void;

export const setHeader: typeof setResponseHeader;

export function appendResponseHeaders(
	event: HTTPEvent,
	headers: Record<string, string>,
): void;
export function appendResponseHeaders(headers: Record<string, string>): void;

export const appendHeaders: typeof appendResponseHeaders;

export function appendResponseHeader(
	event: HTTPEvent,
	name: HTTPHeaderName,
	value: string,
): void;
export function appendResponseHeader(
	name: HTTPHeaderName,
	value: string,
): void;

export const appendHeader: typeof appendResponseHeader;
/**
 * Remove all response headers, or only those specified in the headerNames array.
 * @param event H3 event
 * @param headerNames Array of header names to remove
 */
export function clearResponseHeaders(
	event: HTTPEvent,
	headerNames?: string[],
): void;
export function clearResponseHeaders(headerNames?: string[]): void;

export function removeResponseHeader(
	event: HTTPEvent,
	name: HTTPHeaderName,
): void;
export function removeResponseHeader(name: HTTPHeaderName): void;

export function writeEarlyHints(
	event: HTTPEvent,
	hints: string | string[] | Record<string, string | string[]>,
	cb?: () => void,
): void;
export function writeEarlyHints(
	hints: string | string[] | Record<string, string | string[]>,
	cb?: () => void,
): void;

export function getRequestHeaders(event: HTTPEvent): RequestHeaders;
export function getRequestHeaders(): RequestHeaders;

export const getHeaders: typeof getRequestHeaders;

export function getRequestHeader(
	event: HTTPEvent,
	name: HTTPHeaderName,
): RequestHeaders[string];
export function getRequestHeader(name: HTTPHeaderName): RequestHeaders[string];

export const getHeader: typeof getRequestHeader;

/**
 * Check request caching headers (`If-Modified-Since`) and add caching headers (Last-Modified, Cache-Control)
 * Note: `public` cache control will be added by default
 * @returns `true` when cache headers are matching. When `true` is returned, no reponse should be sent anymore
 */
export function handleCacheHeaders(
	event: HTTPEvent,
	opts: CacheConditions,
): boolean;
export function handleCacheHeaders(opts: CacheConditions): boolean;



/*****************************************************
 * Middleware Utilities
 *****************************************************/

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

/*****************************************************
 * Async Local Storage Utilities
 *****************************************************/

export function getEvent(): HTTPEvent;

/*****************************************************
 * Context Utilities
 *****************************************************/

export function getContext(event: HTTPEvent, key: string): any;
export function getContext(key: string): any;

export function setContext(event: HTTPEvent, key: string, value: any): any;
export function setContext(key: string, value: any): any;

/*****************************************************
 * Proxy Utilities
 *****************************************************/

export function proxyRequest(
	event: HTTPEvent,
	target: string,
	opts?: ProxyOptions,
): Promise<any>;
export function proxyRequest(
	target: string,
	opts?: ProxyOptions,
): Promise<any>;

export function sendProxy(
	event: HTTPEvent,
	target: string,
	opts?: ProxyOptions,
): Promise<any>;
export function sendProxy(target: string, opts?: ProxyOptions): Promise<any>;

export function getProxyRequestHeaders(event: HTTPEvent): any;
export function getProxyRequestHeaders(): any;

/*****************************************************
 * CORS Utilities
 *****************************************************/

export function appendCorsPreflightHeaders(
	event: HTTPEvent,
	options: H3CorsOptions,
): void;
export function appendCorsPreflightHeaders(options: H3CorsOptions): void;

export function appendCorsHeaders(
	event: HTTPEvent,
	options: H3CorsOptions,
): void;
export function appendCorsHeaders(options: H3CorsOptions): void;

export function handleCors(event: HTTPEvent, options: H3CorsOptions): void;
export function handleCors(options: H3CorsOptions): void;

/*****************************************************
 * Send Response Utilities
 *****************************************************/


export function send(event: HTTPEvent, data?: any, type?: string): Promise<void>;
export function send(data?: any, type?: string): Promise<void>;
/**
 * Respond with an empty payload.<br>
 * Note that calling this function will close the connection and no other data can be sent to the client afterwards.
 *
 * @param event H3 event
 * @param code status code to be send. By default, it is `204 No Content`.
 */
export function sendNoContent(event: HTTPEvent, code?: number): void;
export function sendNoContent(code?: number): void;
export function setResponseStatus(
	event: HTTPEvent,
	code?: number,
	text?: string,
): void;
export function setResponseStatus(code?: number, text?: string): void;

export function getResponseStatus(event: HTTPEvent): number;
export function getResponseStatus(): number;

export function getResponseStatusText(event: HTTPEvent): string;
export function getResponseStatusText(): string;
export function defaultContentType(event: HTTPEvent, type?: string): void;
export function defaultContentType(type?: string): void;
export function sendRedirect(
	event: HTTPEvent,
	location: string,
	code?: number,
): Promise<void>;
export function sendRedirect(location: string, code?: number): Promise<void>;

export function sendStream(
	event: HTTPEvent,
	stream: Readable | ReadableStream,
): Promise<void>;
export function sendStream(stream: Readable | ReadableStream): Promise<void>;

export function sendWebResponse(
	event: HTTPEvent,
	response: Response,
): void | Promise<void>;
export function sendWebResponse(response: Response): void | Promise<void>;

/**
 * Receives an error and returns the corresponding response.
 * H3 internally uses this function to handle unhandled errors.
 * Note that calling this function will close the connection and no other data will be sent to the client afterwards.
 *
 * @param event {HTTPEvent} - H3 event or req passed by h3 handler.
 * @param error {Error | H3Error} - The raised error.
 * @param debug {boolean} - Whether the application is in debug mode.
 * In the debug mode, the stack trace of errors will be returned in the response.
 */
export function sendError(
	event: HTTPEvent,
	error: Error | H3Error,
	debug?: boolean,
): void;
export function sendError(error: Error | H3Error, debug?: boolean): void;

/*****************************************************
 * Method Utilities
 *****************************************************/


export function isMethod(
	event: HTTPEvent,
	expected: HTTPMethod | HTTPMethod[],
	allowHead?: boolean,
): boolean;
export function isMethod(
	expected: HTTPMethod | HTTPMethod[],
	allowHead?: boolean,
): boolean;

export function assertMethod(
	event: HTTPEvent,
	expected: HTTPMethod | HTTPMethod[],
	allowHead?: boolean,
): void;
export function assertMethod(
	expected: HTTPMethod | HTTPMethod[],
	allowHead?: boolean,
): void;

export function handleHTTPEvent(event: HTTPEvent): Promise<void>;


export const HTTPEventSymbol: unique symbol;