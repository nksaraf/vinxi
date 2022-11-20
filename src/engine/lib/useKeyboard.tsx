import { useLayoutEffect, useMemo } from "react"

export const useKeyboard = ({
  onKeyDown = null as null | ((event: KeyboardEvent) => void),
  onKeyUp = null as null | ((event: KeyboardEvent) => void)
} = {}) => {
  const keys = useMemo(() => new Set<string>(), [])

  useLayoutEffect(() => {
    const down = (event: KeyboardEvent) => (
      onKeyDown?.(event), keys.add(event.code)
    )
    const up = (event: KeyboardEvent) => (
      onKeyUp?.(event), keys.delete(event.code)
    )

    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
    }
  }, [])

  return useMemo(() => {
    const getKey = (key: string) => (keys.has(key) ? 1 : 0)
    const getAxis = (minKey: string, maxKey: string) =>
      getKey(maxKey) - getKey(minKey)

    return { getKey, getAxis }
  }, [])
}
