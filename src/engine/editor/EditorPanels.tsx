import { useStore } from "statery"
import { Leva } from "leva"
import { store } from "vinxi/systems/editor"

export function EditorPanels() {
  const { editor } = useStore(store)
  return (
    <Leva
      hidden={!editor}
      theme={{
        space: {
          rowGap: "2px",
          md: "10px"
        },
        sizes: {
          titleBarHeight: "28px"
        }
      }}
    />
  )
}
