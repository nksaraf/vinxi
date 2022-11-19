import { useControls, folder } from "leva"
import { useEffect } from "react"
import { Schema } from "leva/dist/declarations/src/types"

export function usePersistedControls<A extends string, T extends Schema>(
  folderName: A,
  props: T
) {
  const [values, set] = useControls(() => {
    Object.keys(props).forEach((key) => {
      let read = JSON.parse(
        localStorage.getItem(`vinxi.${folderName}.${key}`) ?? "null"
      )
      if (read !== null) {
        if (typeof props[key] === "object") {
          props[key].value = read
        } else {
          props[key] = read
        }
      }
    })

    return {
      [folderName]: folder(
        {
          ...props
        },
        {
          collapsed: true
        }
      )
    }
  })

  useEffect(() => {
    Object.keys(values).forEach((key) => {
      localStorage.setItem(
        "vinxi." + folderName + "." + key,
        JSON.stringify(values[key])
      )
    })
  }, [folderName, values])

  return [values, set] as const
}
