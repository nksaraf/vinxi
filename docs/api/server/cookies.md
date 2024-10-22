# Cookies

---

### `parseCookies`

Parse the request to get HTTP Cookie header string and returning an object of all cookie name-value pairs.

```ts file=app/server.ts
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

```ts file=app/server.ts
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

```ts file=app/server.ts
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
