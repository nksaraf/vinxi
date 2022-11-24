import { Debug } from "@react-three/rapier"
import { Perf } from "r3f-perf"
import { folder, useControls } from "leva"
import { store } from "./editor/Editor"

export function Devtools() {
  const { physics, performance } = useControls(
    "world",
    {
      debug: folder(
        {
          physics: false,
          performance: false
        },
        {
          collapsed: true
        }
      )
    },
    {
      collapsed: true,
      store: store.state.store,
      order: 1000
    }
  )
  return (
    <>
      {physics && <Debug />}
      {performance && <Perf position="bottom-left" />}
    </>
  )
}
