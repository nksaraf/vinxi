import { Debug } from "@react-three/rapier"
import { Perf } from "r3f-perf"
import { folder, useControls } from "leva"

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
      collapsed: true
    }
  )
  return (
    <>
      {physics && <Debug />}
      {performance && <Perf position="top-left" />}
    </>
  )
}
