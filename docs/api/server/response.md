# Server API

Vinxi takes care of your server runtime needs. It's built entirely on top of `unjs/h3` and thus gets to export a really powerful and clean consistent server runtime. Along with the help of `unjs/nitro` and `unjs/env`, we are able to abstract over all the different runtimes/platforms. Vinxi provides a set of helpers that covers all the usual use cases of the app to interact with the server platform. Of course, we also exposes the bare platform native objects for you to manipulate as necessary.

Vinxi (via H3) has a concept of composable utilities that accept `event` (from `eventHandler((event) => {})`) as their first argument. This has several performance benefits over injecting them to `event` or `app` instances in global middleware commonly used in Node.js frameworks, such as Express. This concept means only required code is evaluated and bundled, and the rest of the utilities can be tree-shaken when not used.

If you enable `asyncContext` in your `app.config.js`, you can also call these utilities from anywhere without passing the event to it explicitly. It will use `AsyncLocalStorage` to get the current event from the context.

## Request Info

---

### `getRequestHost`

Get the request host

```ts twoslash file=app/server.ts
import { eventHandler, getRequestHost } from "vinxi/http"

export default eventHandler(async (event) => {
  const host = getRequestHost(event) // [!code highlight]
})
```

::: details Signature

```ts
export function getRequestHost(
  event: HTTPEvent,
  opts?: {
    xForwardedHost?: boolean
  },
): string
```

:::

---

### `getRequestProtocol`

Get the request protocol, whether its `http` or `https`.

```ts twoslash file=app/server.ts
import { eventHandler, getRequestProtocol } from "vinxi/http"

export default eventHandler(async (event) => {
  const protocol = getRequestProtocol(event) // [!code highlight]
})
```

::: details Signature

```ts
export function getRequestProtocol(
  event: HTTPEvent,
  opts?: {
    xForwardedProto?: boolean
  },
): "https" | "http"
```

:::

---

### `getRequestURL`

Get the request [URL](url)

```ts twoslash file=app/server.ts
// @noErrors
import { eventHandler, getRequestURL } from "vinxi/http"

export default eventHandler(async (event) => {
  const url = getRequestURL(event)

  url.protocol // "http"
  url.hostname // "localhost"
  url.port // "3000"
  url.host // "localhost:3000"
  url.username // ""
  url.password // ""
  url.origin // "http://localhost:3000"
  url.pathname // "/products"
  url.search // "?category=shoes"
  url.searchParams // URLSearchParams { category: "shoes" };
  url.hash // "#section";
  url.href // "http://localhost:3000/products?category=shoes#section";
})
```

::: details Signature

```ts
export function getRequestURL(
  event: HTTPEvent,
  opts?: {
    xForwardedHost?: boolean
    xForwardedProto?: boolean
  },
): URL
```

:::

### `getRequestIP`

Get the request IP, if visible.

```ts twoslash file=app/server.ts
import { eventHandler, getRequestIP } from "vinxi/http"

export default eventHandler(async (event) => {
  const ip = getRequestIP(event) // [!code highlight]
})
```

::: details Signature

```ts
export function getRequestIP(
  event: HTTPEvent,
  opts?: {
    xForwardedFor?: boolean
  },
): string | undefined
```

:::

### `isPreflightRequest`

Check if the request is a CORS preflight request

```ts twoslash file=app/server.ts
import { eventHandler, isPreflightRequest } from "vinxi/http"

export default eventHandler(async (event) => {
  const isPreflight = isPreflightRequest(event) // [!code highlight]
})
```

::: details Signature

```ts
export function isPreflightRequest(event: HTTPEvent): boolean
```

:::

### `getWebRequest`

Get a Web Fetch API compliant [`Request`]() instance from the [`HTTPEvent`](httpevent)

```ts twoslash
import { eventHandler, getWebRequest } from "vinxi/http"

export default eventHandler(async (event) => {
  const request = getWebRequest(event) // [!code highlight]

  request.url
  request.method
  request.headers
  request.json()
  request.formData()
  request.text()
  request.arrayBuffer()
  request.blob()
})
```

::: details Signature

```ts
export function getWebRequest(event: HTTPEvent): Request
```

:::

## Request Body

---

### `readBody`

Reads request body and tries to safely parse as JSON using [destr](https://github.com/unjs/destr).

```ts twoslash file=app/server.ts
import { eventHandler, readBody } from "vinxi/http"

export default eventHandler(async (event) => {
  const body = await readBody(event) // [!code highlight]
})
```

::: details Signature

```ts
function readBody<
  T,
  Event extends H3Event<EventHandlerRequest> = H3Event<EventHandlerRequest>,
  _T = InferEventInput<"body", Event, T>,
>(event: Event, options?: { strict?: boolean }): Promise<_T>
```

:::

---

### `readFormData`

Constructs a `FormData` object from an event, after converting it to a a web request.

```ts twoslash file=app/server.ts
import { eventHandler, readFormData } from "vinxi/http"

export default eventHandler(async (event) => {
  const formData = await readFormData(event) // [!code highlight]
  const email = formData.get("email")
  const password = formData.get("password")
})
```

::: details Signature

```ts twoslash file=vinxi/http
// @lib: es2015
// @filename: index.d.ts
import { HTTPEvent, readFormData } from "vinxi/http"
import { FormData } from "vinxi/types/web"

// ---cut---
export function readFormData(event: HTTPEvent): Promise<FormData>
```

:::

---

### `readMultipartFormData`

Tries to read and parse the body of an HTTPEvent as a multipart form.

```ts twoslash file=app/server.ts
import { eventHandler, readMultipartFormData } from "vinxi/http"

export default eventHandler(async (event) => {
  const data = await readMultipartFormData(event) // [!code highlight]
})
```

::: details Signature

```ts twoslash file=vinxi/http
import { HTTPEvent } from "vinxi/http"
import { FormData } from "vinxi/types/web"

// @lib: es2015
// @filename: index.d.ts

type MultiPartData = {
  data: Buffer
  name?: string
  filename?: string
  type?: string
}

// ---cut---
export function readMultipartFormData(
  event: HTTPEvent,
): Promise<MultiPartData[] | undefined>
```

:::

---

### `readValidatedBody`

Tries to read the request body via `readBody`, then uses the provided validation function and either throws a validation error or returns the result.

#### Using `zod`

```ts twoslash file=app/server.ts
import { eventHandler, readValidatedBody } from "vinxi/http"
import { z } from "zod"

const objectSchema = z.object({
  email: z.string(),
  password: z.string(),
})
//
export default eventHandler(async (event) => {
  const body = await readValidatedBody(event, objectSchema.safeParse)
})
```

#### Using custom validation function

```ts twoslash file=app/server.ts
import { eventHandler, readValidatedBody } from "vinxi/http"

//
export default eventHandler(async (event) => {
  // With a custom validation function
  const body = await readValidatedBody(event, (body) => {
    return typeof body === "object" && body !== null
  })
})
```

::: details Signature

```ts
export function readValidatedBody<
  T,
  Event extends HTTPEvent = HTTPEvent,
  _T = InferEventInput<"body", Event, T>,
>(event: Event, validate: ValidateFunction<_T>): Promise<_T>
```

:::

---

### `readRawBody`

Reads body of the request and returns encoded raw string (default), or Buffer if encoding is falsy.

```ts [app/server.ts]
import { eventHandler, readRawBody } from "vinxi/http"

export default eventHandler(async (event) => {
  const body = await readRawBody(event, "utf-8") // [!code highlight]
})
```

::: details Signature

```ts
function readRawBody<E extends Encoding = "utf8">(
  event: HTTPEvent,
  encoding?: E,
): E extends false ? Promise<Buffer | undefined> : Promise<string | undefined>
```

:::

---

### `getRequestWebStream`

Captures a [ReadableStream](readablestream) from a request.

```ts twoslash
import { eventHandler, getRequestWebStream } from "vinxi/http"

export default eventHandler(async (event) => {
  const stream = getRequestWebStream(event) // [!code highlight]
})
```

::: details Signature

```ts twoslash
// @lib: es2015
// @filename: index.d.ts
import { HTTPEvent } from "vinxi/http"
import { ReadableStream } from "vinxi/types/web"

// ---cut---
export function getRequestWebStream(
  event: HTTPEvent,
): ReadableStream | undefined
```

:::

---

### `getQuery`

Get the query

```ts twoslash file=app/server.ts
import { eventHandler, getQuery } from "vinxi/http"

export default eventHandler(async (event) => {
  const query = getQuery(event) // [!code highlight]
})
```

::: details Signature

```ts
export function getQuery<
  T,
  Event extends HTTPEvent = HTTPEvent,
  _T = Exclude<InferEventInput<"query", Event, T>, undefined>,
>(event: Event): _T
```

:::

---

### `getValidatedQuery`

Get the validated query

```ts twoslash file=app/server.ts
import { eventHandler, getValidatedQuery } from "vinxi/http"

export default eventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => {
    return typeof query === "object" && query !== null
  }) // [!code highlight]
})
```

::: details Signature

```ts
export function getValidatedQuery<
  T,
  Event extends HTTPEvent = HTTPEvent,
  _T = InferEventInput<"query", Event, T>,
>(event: Event, validate: ValidateFunction<_T>): Promise<_T>
```

:::

---

## Cookies

---

### `parseCookies`

Parse the request to get HTTP Cookie header string and returning an object of all cookie name-value pairs.

```ts twoslash file=app/server.ts
import { eventHandler, parseCookies } from "vinxi/http"

export default eventHandler(async (event) => {
  const cookies = parseCookies(event) // [!code highlight]

  cookies["authorization"] // "*******"
})
```

::: details Signature

```ts
export function parseCookies(event: HTTPEvent): Record<string, string>
```

:::

---

### `getCookie`

Get a cookie value by name.

```ts twoslash file=app/server.ts
import { eventHandler, getCookie } from "vinxi/http"

export default eventHandler(async (event) => {
  const authorization = getCookie(event, "Authorization") //
  if (authorization) {
    // ...
  }
})
```

::: details Signature

```ts
export function getCookie(event: HTTPEvent, name: string): string | undefined
```

:::

---

### `setCookie`

Set a cookie value by name.

```ts twoslash file=app/server.ts
import { eventHandler, setCookie } from "vinxi/http"

export default eventHandler(async (event) => {
  setCookie(event, "Authorization", "1234567") // [!code highlight]
})
```

::: details Signature

```ts
export function setCookie(
  event: HTTPEvent,
  name: string,
  value: string,
  serializeOptions?: CookieSerializeOptions,
): void
```

:::

---

### `deleteCookie`

Delete a cookie by name

::: details Signature

```ts
export function deleteCookie(
  event: HTTPEvent,
  name: string,
  serializeOptions?: CookieSerializeOptions,
): void
```

:::

## Fetch

### fetchWithEvent

::: details Signature

```ts
export function fetchWithEvent<
  T = unknown,
  _R = any,
  F extends (req: RequestInfo | URL, opts?: any) => any = typeof fetch,
>(
  event: HTTPEvent,
  req: RequestInfo | URL,
  init?: RequestInit & {
    context?: H3EventContext
  },
  options?: {
    fetch: F
  },
): unknown extends T ? ReturnType<F> : T
```

:::

## Router Param

### `getRouterParams(event, opts)`: Get the router params

```ts
export function getRouterParams(
  event: HTTPEvent,
  opts?: {
    decode?: boolean
  },
): NonNullable<HTTPEvent["context"]["params"]>
```

### `getValidatedRouterParams(event, validate, opts)`: Get the validated router params

```ts
export function getValidatedRouterParams<
  T,
  Event extends HTTPEvent = HTTPEvent,
  _T = InferEventInput<"routerParams", Event, T>,
>(
  event: Event,
  validate: ValidateFunction<_T>,
  opts?: {
    decode?: boolean
  },
): Promise<_T>
```

### `getRouterParam(event, name, opts)`: Get a router param by name

```ts
export function getRouterParam(
  event: HTTPEvent,
  name: string,
  opts?: {
    decode?: boolean
  },
): string | undefined
```

## Session

### `clearSession(event, config)`: Clear the session

```ts
export function clearSession(
  event: HTTPEvent,
  config: Partial<SessionConfig>,
): Promise<void>
```

### `unsealSession(event, config, sealed)`: Unseal the session

```ts
export function unsealSession(
  event: HTTPEvent,
  config: SessionConfig,
  sealed: string,
): Promise<Partial<Session<SessionDataT>>>
```

### `getSession(event, config)`: Get the session

```ts
export function getSession<T extends SessionDataT = SessionDataT>(
  event: HTTPEvent,
  config: SessionConfig,
): Promise<Session<T>>
```

### `sealSession(event, config)`: Seal the session

```ts
export function sealSession(event: HTTPEvent, config: SessionConfig): void
```

### `updateSession(event, config, update)`: Update the session

```ts
export function updateSession<T extends SessionDataT = SessionDataT>(
  event: HTTPEvent,
  config: SessionConfig,
  update?: SessionUpdate<T>,
): Promise<Session<T>>
```

### `useSession(event, config)`: Use the session

```ts
export function useSession<T extends SessionDataT = SessionDataT>(
  event: HTTPEvent,
  config: SessionConfig,
): Promise<{
  readonly id: string | undefined
  readonly data: T
  update: (update: SessionUpdate<T>) => Promise<any>
  clear: () => Promise<any>
}>
```

## Header

### `getResponseHeaders(event)`: Get the response headers

```ts
export function getResponseHeaders(
  event: HTTPEvent,
): ReturnType<HTTPEvent["res"]["getHeaders"]>
```

### `getResponseHeader(event, name)`: Get a response header by name

```ts
export function getResponseHeader(
  event: HTTPEvent,
  name: HTTPHeaderName,
): ReturnType<HTTPEvent["res"]["getHeader"]>
```

### `setResponseHeaders(event, headers)`: Set the response headers

```ts
export function setResponseHeaders(
  event: HTTPEvent,
  headers: Record<HTTPHeaderName, Parameters<OutgoingMessage["setHeader"]>[1]>,
): void
```

### `setResponseHeader(event, name, value)`: Set a response header by name

```ts
export function setResponseHeader(
  event: HTTPEvent,
  name: HTTPHeaderName,
  value: Parameters<OutgoingMessage["setHeader"]>[1],
): void
```

### `appendResponseHeaders(event, headers)`: Append the response headers

```ts
export function appendResponseHeaders(
  event: HTTPEvent,
  headers: Record<string, string>,
): void
```

### `appendResponseHeader(event, name, value)`: Append a response header by name

```ts
export function appendResponseHeader(
  event: HTTPEvent,
  name: HTTPHeaderName,
  value: string,
): void
```

### `clearResponseHeaders(event, headerNames)`: Clear the response headers

```ts
export function clearResponseHeaders(
  event: HTTPEvent,
  headerNames?: string[],
): void
```

### `removeResponseHeader(event, name)`: Remove a response header by name

```ts
export function removeResponseHeader(
  event: HTTPEvent,
  name: HTTPHeaderName,
): void
```

### `writeEarlyHints(event, hints, cb)`: Write early hints

```ts
export function writeEarlyHints(
  event: HTTPEvent,
  hints: string | string[] | Record<string, string | string[]>,
  cb?: () => void,
): void
```

### `getRequestHeaders(event)`: Get the request headers

```ts
export function getRequestHeaders(event: HTTPEvent): RequestHeaders
```

### `getRequestHeader(event, name)`: Get a request header by name

```ts
export function getRequestHeader(
  event: HTTPEvent,
  name: HTTPHeaderName,
): RequestHeaders[string]
```

## Middleware

### `defineMiddleware(options)`: Define middleware

```ts
export function defineMiddleware(options: {
  onRequest?:
    | import("h3")._RequestMiddleware
    | import("h3")._RequestMiddleware[]
  onBeforeResponse?:
    | import("h3")._ResponseMiddleware
    | import("h3")._ResponseMiddleware[]
}): {
  onRequest?:
    | import("h3")._RequestMiddleware
    | import("h3")._RequestMiddleware[]
    | undefined
  onBeforeResponse?:
    | import("h3")._ResponseMiddleware
    | import("h3")._ResponseMiddleware[]
    | undefined
}
```

## Error

### `sendError(event, error, debug)`: Send an error

```ts
export function sendError(event: HTTPEvent, error: any, debug?: any): void
```

### `createError({ statusCode, statusMessage, data })`: Create an error

```ts
export function createError({
  statusCode,
  statusMessage,
  data,
}: {
  statusCode?: number
  statusMessage?: string
  data?: any
}): Error
```

## Route

### `useBase(base, handler)`: Use a base

```ts
export function useBase(base: string, handler: RequestHandler): RequestHandler
```

## Proxy

### `sendProxy(event, options)`: Send a proxy

```ts
export function sendProxy(
  event: HTTPEvent,
  options: {
    target: string | URL
    [key: string]: any
  },
): Promise<void>
```

### `proxyRequest(event, options)`: Proxy a request

```ts
export function proxyRequest(
  event: HTTPEvent,
  options: {
    target: string | URL
    [key: string]: any
  },
): Promise<void>
```

## Request

### Get query

```ts
function getQuery<
    T,
    Event extends H3Event<EventHandlerRequest> = H3Event<EventHandlerRequest>,
    _T = Exclude<InferEventInput<'query', Event, T>, undefined>
>(
    event: Event
) => _T;
```

- `getValidatedQuery(event, validate)`
- `getRouterParams(event, { decode? })`
- `getRouterParam(event, name, { decode? })`
- `getValidatedRouterParams(event, validate, { decode? })`
- `getMethod(event, default?)`
- `isMethod(event, expected, allowHead?)`
- `assertMethod(event, expected, allowHead?)`
- `getRequestHeaders(event, headers)` (alias: `getHeaders`)
- `getRequestHeader(event, name)` (alias: `getHeader`)
- `getRequestURL(event)`
- `getRequestHost(event)`
- `getRequestProtocol(event)`
- `getRequestPath(event)`
- `getRequestIP(event, { xForwardedFor: boolean })`

### Response

- `send(event, data, type?)`
- `sendNoContent(event, code = 204)`
- `setResponseStatus(event, status)`
- `getResponseStatus(event)`
- `getResponseStatusText(event)`
- `getResponseHeaders(event)`
- `getResponseHeader(event, name)`
- `setResponseHeaders(event, headers)` (alias: `setHeaders`)
- `setResponseHeader(event, name, value)` (alias: `setHeader`)
- `appendResponseHeaders(event, headers)` (alias: `appendHeaders`)
- `appendResponseHeader(event, name, value)` (alias: `appendHeader`)
- `defaultContentType(event, type)`
- `sendRedirect(event, location, code=302)`
- `isStream(data)`
- `sendStream(event, data)`
- `writeEarlyHints(event, links, callback)`

### Sanitize

- `sanitizeStatusMessage(statusMessage)`
- `sanitizeStatusCode(statusCode, default = 200)`

### Error

- `sendError(event, error, debug?)`
- `createError({ statusCode, statusMessage, data? })`

### Route

- `useBase(base, handler)`

### Proxy

- `sendProxy(event, { target, ...options })`
- `proxyRequest(event, { target, ...options })`
- `fetchWithEvent(event, req, init, { fetch? }?)`
- `getProxyRequestHeaders(event)`

### Cookie

- `parseCookies(event)`
- `getCookie(event, name)`
- `setCookie(event, name, value, opts?)`
- `deleteCookie(event, name, opts?)`
- `splitCookiesString(cookiesString)`

### Session

- `useSession(event, config = { password, maxAge?, name?, cookie?, seal?, crypto? })`
- `getSession(event, config)`
- `updateSession(event, config, update)`
- `sealSession(event, config)`
- `unsealSession(event, config, sealed)`
- `clearSession(event, config)`

### Cache

- `handleCacheHeaders(event, opts)`

### Cors

- `handleCors(options)` (see [h3-cors](https://github.com/NozomuIkuta/h3-cors) for more detail about options)
- `isPreflightRequest(event)`
- `isCorsOriginAllowed(event)`
- `appendCorsHeaders(event, options)` (see [h3-cors](https://github.com/NozomuIkuta/h3-cors) for more detail about options)
- `appendCorsPreflightHeaders(event, options)` (see [h3-cors](https://github.com/NozomuIkuta/h3-cors) for more detail about options)

````ts
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
	headers: Record<HTTPHeaderName, Parameters<OutgoingMessage["setHeader"]>[1]>,
): void;
export function setResponseHeaders(
	headers: Record<HTTPHeaderName, Parameters<OutgoingMessage["setHeader"]>[1]>,
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
````
