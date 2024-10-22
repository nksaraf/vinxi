# Request

---

## Request Headers

---

### `getRequestHeaders`

Get the request headers

```ts file=app/server.ts
import { eventHandler, getRequestHeaders } from "vinxi/http";

export default eventHandler(async (event) => {
  const headers = getRequestHeaders(event); // [!code highlight]
});
```

::: details Signature

```ts
export function getRequestHeaders(event: HTTPEvent): RequestHeaders;
```

:::

---

### `getRequestHeader`

Get a request header by name

```ts file=app/server.ts
import { eventHandler, getRequestHeader } from "vinxi/http";

export default eventHandler(async (event) => {
  const header = getRequestHeader(event, "content-type"); // [!code highlight]
});
```

::: details Signature

```ts
export function getRequestHeader(
  event: HTTPEvent,
  name: HTTPHeaderName,
): RequestHeaders[string];
```

:::

## Request Body

---

### `readBody`

Reads request body and tries to safely parse as JSON using [destr](https://github.com/unjs/destr).

```ts file=app/server.ts
import { eventHandler, readBody } from "vinxi/http";

export default eventHandler(async (event) => {
  const body = await readBody(event); // [!code highlight]
});
```

::: details Signature

```ts
function readBody<
  T,
  Event extends H3Event<EventHandlerRequest> = H3Event<EventHandlerRequest>,
  _T = InferEventInput<"body", Event, T>,
>(event: Event, options?: { strict?: boolean }): Promise<_T>;
```

:::

---

### `readFormData`

Constructs a `FormData` object from an event, after converting it to a a web request.

```ts file=app/server.ts
import { eventHandler, readFormData } from "vinxi/http";

export default eventHandler(async (event) => {
  const formData = await readFormData(event); // [!code highlight]
  const email = formData.get("email");
  const password = formData.get("password");
});
```

::: details Signature

```ts
export function readFormData(event: HTTPEvent): Promise<FormData>;
```

:::

---

### `readMultipartFormData`

Tries to read and parse the body of an HTTPEvent as a multipart form.

```ts file=app/server.ts
import { eventHandler, readMultipartFormData } from "vinxi/http";

export default eventHandler(async (event) => {
  const data = await readMultipartFormData(event); // [!code highlight]
});
```

::: details Signature

```ts
type MultiPartData = {
  data: Buffer;
  name?: string;
  filename?: string;
  type?: string;
};

export function readMultipartFormData(
  event: HTTPEvent,
): Promise<MultiPartData[] | undefined>;
```

:::

---

### `readValidatedBody`

Tries to read the request body via `readBody`, then uses the provided validation function and either throws a validation error or returns the result.

#### Using `zod`

```ts file=app/server.ts
import { eventHandler, readValidatedBody } from "vinxi/http";
import { z } from "zod";

const objectSchema = z.object({
  email: z.string(),
  password: z.string(),
});
//
export default eventHandler(async (event) => {
  const body = await readValidatedBody(event, objectSchema.safeParse);
});
```

#### Using custom validation function

```ts file=app/server.ts
import { eventHandler, readValidatedBody } from "vinxi/http";

//
export default eventHandler(async (event) => {
  // With a custom validation function
  const body = await readValidatedBody(event, (body) => {
    return typeof body === "object" && body !== null;
  });
});
```

::: details Signature

```ts
export function readValidatedBody<
  T,
  Event extends HTTPEvent = HTTPEvent,
  _T = InferEventInput<"body", Event, T>,
>(event: Event, validate: ValidateFunction<_T>): Promise<_T>;
```

:::

---

### `readRawBody`

Reads body of the request and returns encoded raw string (default), or Buffer if encoding is falsy.

```ts [app/server.ts]
import { eventHandler, readRawBody } from "vinxi/http";

export default eventHandler(async (event) => {
  const body = await readRawBody(event, "utf-8"); // [!code highlight]
});
```

::: details Signature

```ts
function readRawBody<E extends Encoding = "utf8">(
  event: HTTPEvent,
  encoding?: E,
): E extends false ? Promise<Buffer | undefined> : Promise<string | undefined>;
```

:::

---

### `getRequestWebStream`

Captures a [ReadableStream][readablestream] from a request.

```ts
import { eventHandler, getRequestWebStream } from "vinxi/http";

export default eventHandler(async (event) => {
  const stream = getRequestWebStream(event); // [!code highlight]
});
```

::: details Signature

```ts
// @lib: es2015
// @filename: index.d.ts
import { HTTPEvent } from "vinxi/http";
import { ReadableStream } from "vinxi/types/web";

// ---cut---
export function getRequestWebStream(
  event: HTTPEvent,
): ReadableStream | undefined;
```

:::

---

## Request Query

---

### `getQuery`

Get the query

```ts file=app/server.ts
import { eventHandler, getQuery } from "vinxi/http";

export default eventHandler(async (event) => {
  const query = getQuery(event); // [!code highlight]
});
```

::: details Signature

```ts
export function getQuery<
  T,
  Event extends HTTPEvent = HTTPEvent,
  _T = Exclude<InferEventInput<"query", Event, T>, undefined>,
>(event: Event): _T;
```

:::

---

### `getValidatedQuery`

Get the validated query

```ts file=app/server.ts
import { eventHandler, getValidatedQuery } from "vinxi/http";

export default eventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => {
    return typeof query === "object" && query !== null;
  }); // [!code highlight]
});
```

::: details Signature

```ts
export function getValidatedQuery<
  T,
  Event extends HTTPEvent = HTTPEvent,
  _T = InferEventInput<"query", Event, T>,
>(event: Event, validate: ValidateFunction<_T>): Promise<_T>;
```

:::

---

## Request Info

---

### `getRequestHost`

Get the request host

```ts file=app/server.ts
import { eventHandler, getRequestHost } from "vinxi/http";

export default eventHandler(async (event) => {
  const host = getRequestHost(event); // [!code highlight]
});
```

::: details Signature

```ts
export function getRequestHost(
  event: HTTPEvent,
  opts?: {
    xForwardedHost?: boolean;
  },
): string;
```

:::

---

### `getRequestProtocol`

Get the request protocol, whether its `http` or `https`.

```ts file=app/server.ts
import { eventHandler, getRequestProtocol } from "vinxi/http";

export default eventHandler(async (event) => {
  const protocol = getRequestProtocol(event); // [!code highlight]
});
```

::: details Signature

```ts
export function getRequestProtocol(
  event: HTTPEvent,
  opts?: {
    xForwardedProto?: boolean;
  },
): "https" | "http";
```

:::

---

### `getRequestURL`

Get the request [URL][url]

```ts file=app/server.ts
// @noErrors
import { eventHandler, getRequestURL } from "vinxi/http";

export default eventHandler(async (event) => {
  const url = getRequestURL(event);

  url.protocol; // "http"
  url.hostname; // "localhost"
  url.port; // "3000"
  url.host; // "localhost:3000"
  url.username; // ""
  url.password; // ""
  url.origin; // "http://localhost:3000"
  url.pathname; // "/products"
  url.search; // "?category=shoes"
  url.searchParams; // URLSearchParams { category: "shoes" };
  url.hash; // "#section";
  url.href; // "http://localhost:3000/products?category=shoes#section";
});
```

::: details Signature

```ts
export function getRequestURL(
  event: HTTPEvent,
  opts?: {
    xForwardedHost?: boolean;
    xForwardedProto?: boolean;
  },
): URL;
```

:::

### `getRequestIP`

Get the request IP, if visible.

```ts file=app/server.ts
import { eventHandler, getRequestIP } from "vinxi/http";

export default eventHandler(async (event) => {
  const ip = getRequestIP(event); // [!code highlight]
});
```

::: details Signature

```ts
export function getRequestIP(
  event: HTTPEvent,
  opts?: {
    xForwardedFor?: boolean;
  },
): string | undefined;
```

:::

### `isPreflightRequest`

Check if the request is a CORS preflight request

```ts file=app/server.ts
import { eventHandler, isPreflightRequest } from "vinxi/http";

export default eventHandler(async (event) => {
  const isPreflight = isPreflightRequest(event); // [!code highlight]
});
```

::: details Signature

```ts
export function isPreflightRequest(event: HTTPEvent): boolean;
```

:::

### `getWebRequest`

Get a Web Fetch API compliant [`Request`][request] instance from the [`HTTPEvent`][httpevent]

```ts
import { eventHandler, getWebRequest } from "vinxi/http";

export default eventHandler(async (event) => {
  const request = getWebRequest(event); // [!code highlight]

  request.url;
  request.method;
  request.headers;
  request.json();
  request.formData();
  request.text();
  request.arrayBuffer();
  request.blob();
});
```

::: details Signature

```ts
export function getWebRequest(event: HTTPEvent): Request;
```

:::

[readablestream]: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
[httpevent]: https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent
[url]: https://developer.mozilla.org/en-US/docs/Web/API/URL
[request]: https://developer.mozilla.org/en-US/docs/Web/API/Request
