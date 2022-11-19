import { useFrame } from "@react-three/fiber"
import { folder } from "leva"
import { Vector3, Euler } from "three"
import { game } from "../game"
import { registerComponent } from "./editor"

const follower = game.world.with("helper$", "transform")

export default function RenderSystem() {
  useFrame(function helperSystem() {
    for (const entity of follower) {
      entity.helper$.position.copy(entity.transform.position)
    }
  })

  return null
}

registerComponent("transform", {
  addTo(e) {
    game.world.addComponent(e, "transform", {
      position: new Vector3(0, 0, 0),
      rotation: new Euler(0, 0, 0),
      scale: new Vector3(1, 1, 1)
    })
  },
  controls(entity) {
    return {
      transform: folder(
        {
          position: {
            step: 0.5,
            value: entity.transform.position.toArray(),
            onChange: (value) => {
              entity.transform.position.fromArray(value)
              // @ts-ignore
              entity.transformControls$?.object?.position.fromArray(value)
            },
            transient: true
          },
          rotation: {
            step: 0.1,
            value: [
              entity.transform.rotation.x,
              entity.transform.rotation.y,
              entity.transform.rotation.z
            ],
            onChange: (value) => {
              entity.transform.rotation.fromArray([...value, "XYZ"] as any)
            },
            transient: true
          },
          scale: {
            step: 0.5,
            value: entity.transform.scale.toArray(),
            onChange: (value) => {
              entity.transform.scale.fromArray(value)
            },
            transient: true
          }
        },
        {
          collapsed: true
        }
      )
    }
  }
})
