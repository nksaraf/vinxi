# Session

---

### `useSession`

Use the session to read and update the session data

```ts twoslash file=app/server.ts
import { type SessionConfig, eventHandler, useSession } from "vinxi/http"

const sessionConfig = {
  password: "my-secret",
} as SessionConfig

type SessionData = {
  user: string
  role: string
}

export default eventHandler(async (event) => {
  const session = await useSession<SessionData>(event, sessionConfig) // [!code highlight]

  session.data // { user: "vinxi", role: "admin" }
  session.id // "14678"
  await session.update({ role: "member" })
  await session.clear()
})
```

::: details Signature

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

:::

---

### `getSession`

Get the session

```ts twoslash file=app/server.ts
import { type SessionConfig, eventHandler, getSession } from "vinxi/http"

const sessionConfig = {
  password: "my-secret",
} as SessionConfig

type SessionData = {
  user: string
  role: string
}

export default eventHandler(async (event) => {
  const session = await getSession<SessionData>(event, sessionConfig) // [!code highlight]

  session.data // { user: "vinxi", role: "admin" }
  session.id // "xas21312
  session.createdAt
})
```

::: details Signature

```ts
export function getSession<T extends SessionDataT = SessionDataT>(
  event: HTTPEvent,
  config: SessionConfig,
): Promise<Session<T>>
```

:::

---

### `updateSession`

Update the session

```ts twoslash file=app/server.ts
import { type SessionConfig, eventHandler, updateSession } from "vinxi/http"

const sessionConfig = {
  password: "my-secret",
} as SessionConfig

type SessionData = {
  user: string
  role: string
}

export default eventHandler(async (event) => {
  const session = await updateSession<SessionData>(event, sessionConfig, { // [!code highlight]
    role: "member", // [!code highlight]
  }) // [!code highlight]
})
```

::: details Signature

```ts
export function updateSession<T extends SessionDataT = SessionDataT>(
  event: HTTPEvent,
  config: SessionConfig,
  update?: SessionUpdate<T>,
): Promise<Session<T>>
```

:::

---

### `clearSession`

Clear the session

```ts twoslash file=app/server.ts
import { type SessionConfig, clearSession, eventHandler } from "vinxi/http"

const sessionConfig = {
  password: "my-secret",
} as SessionConfig

export default eventHandler(async (event) => {
  await clearSession(event, sessionConfig) // [!code highlight]
})
```

::: details Signature

```ts
export function clearSession(
  event: HTTPEvent,
  config: Partial<SessionConfig>,
): Promise<void>
```

## :::

### `sealSession(event, config)`: Seal the session

```ts
export function sealSession(event: HTTPEvent, config: SessionConfig): void
```

### `unsealSession`

Unseal the session

```ts twoslash file=app/server.ts
import { type SessionConfig, eventHandler, unsealSession } from "vinxi/http"

const sessionConfig = {
  password: "my-secret",
} as SessionConfig

export default eventHandler(async (event) => {
  const session = await unsealSession(event, sessionConfig, "xas21312") // [!code highlight]
})
```

::: details Signature

```ts
export function unsealSession(
  event: HTTPEvent,
  config: SessionConfig,
  sealed: string,
): Promise<Partial<Session<SessionDataT>>>
```

:::

---
