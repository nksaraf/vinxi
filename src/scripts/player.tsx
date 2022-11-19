import { Html } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { createStateMachine } from "state-composer"
import { game } from "vinxi/game"

const state = createStateMachine<"idle" | "walk">("idle")

export default function Player({ entity }: { entity: Components }) {
  console.log(entity)

  useFrame(() => {
    if (entity.controller?.movement) {
      if (entity.controller?.movement.velocity[2] > 0.1) {
        state.enter("walk")
        if (entity.mixer$) {
          entity.mixer$.actions.Idle?.stop()
          entity.mixer$.actions.Walk.play()
        }
      } else {
        state.enter("idle")
        if (entity.mixer$) {
          entity.mixer$.actions.Idle?.play()
          entity.mixer$.actions.Walk?.stop()
        }
      }
    }
  })

  return (
    <game.Component name="mesh$">
      <group>
        <Html transform>
          <div style={{ backgroundColor: "white" }}>
            <state.Match state={"idle"}>idle</state.Match>
            <state.Match state={"walk"}>walk</state.Match>
          </div>
        </Html>
      </group>
    </game.Component>
  )
}
