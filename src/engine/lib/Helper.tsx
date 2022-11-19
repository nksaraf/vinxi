import { useHelper } from "@react-three/drei"
import { useEffect } from "react"
import { useLayoutEffect } from "react"
import { bitmask } from "render-composer"

export function Helper({ helper, entity, ...props }) {
  let ref = useHelper(
    {
      get current() {
        return entity()
      }
    },
    helper
  )

  useEffect(() => {
    if (ref.current) {
      ref.current.layers.mask = bitmask(1)
      ref.current.traverse((o) => {
        o.layers.mask = bitmask(1)
      })
    }
  }, [ref])
  return null
}
