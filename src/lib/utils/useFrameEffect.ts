import { useFrame } from "@react-three/fiber"
import { useRef } from "react"

/* from: https://gist.github.com/hmans/ba9c7919d3ac9b05d0935dc40e3a9177 */

export function useFrameEffect<T>(
  dependencyCallback: () => T,
  callback: (args: T) => void,
  renderPriority = 0,
) {
  const value = useRef<T>(null!)

  useFrame(() => {
    const newValue = dependencyCallback()

    if (value.current !== newValue) {
      value.current = newValue
      callback(newValue)
    }
  }, renderPriority)
}
