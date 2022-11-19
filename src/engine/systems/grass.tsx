import { extend, useFrame } from "@react-three/fiber"
import { folder } from "leva"
import { Suspense } from "react"
import {
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  InstancedMesh,
  PlaneGeometry,
  Quaternion,
  RawShaderMaterial,
  Vector3
} from "three"
import { createGrassGeometry, Grass } from "../lib/GrassMaterial"
import { game } from "../game"
import { registerComponent } from "./editor"

declare global {
  export interface Components {
    grass?: {
      width: number
      count: number
      bladeHeight: number
      bladeWidth: number
    }
    grass$?: InstancedMesh<InstancedBufferGeometry, RawShaderMaterial>
  }
}

const grass = game.world.with("grass")
const grassRef = game.world.with("grass$")

registerComponent("grass", {
  addTo(entity) {
    game.world.addComponent(entity, "grass", {
      width: 10,
      count: 100,
      bladeHeight: 0.5,
      bladeWidth: 0.12
    })
  },
  controls(entity) {
    return {
      grass: folder(
        {
          width: {
            value: entity.grass.width ?? 10,
            step: 1,
            onChange(e) {
              if (e !== entity.grass.width) {
                entity.grass.width = e
                entity.grass$.geometry.dispose()
                entity.grass$.geometry = createGrassGeometry(entity.grass)
                entity.grass$.material.uniforms.width.value = e
              }
            }
          },
          count: {
            value: entity.grass.count ?? 100,
            onChange(e) {
              if (e !== entity.grass.count) {
                entity.grass.count = e
                entity.grass$.geometry.dispose()
                entity.grass$.geometry = createGrassGeometry(entity.grass)
              }
            }
          },
          bladeHeight: {
            value: entity.grass.bladeHeight ?? 0.5,
            step: 0.05,
            onChange(e) {
              if (e !== entity.grass.bladeHeight) {
                entity.grass.bladeHeight = e
                entity.grass$.geometry.dispose()
                entity.grass$.geometry = createGrassGeometry(entity.grass)
                entity.grass$.material.uniforms.bladeHeight.value = e
              }
            }
          },
          bladeWidth: {
            value: entity.grass.bladeWidth ?? 0.12,
            step: 0.01,
            onChange(e) {
              if (e !== entity.grass.bladeWidth) {
                entity.grass.bladeWidth = e
                entity.grass$.geometry.dispose()
                entity.grass$.geometry = createGrassGeometry(entity.grass)
              }
            }
          }
        },
        {
          collapsed: true
        }
      )
    }
  }
})

export default function GrassSystem() {
  useFrame(() => {
    for (const entity of grassRef) {
      if (entity.grass$) {
        entity.grass$.position.copy(entity.transform.position)
      }
    }
  })
  return (
    <>
      <game.Entities in={grass}>
        {(entity) => (
          <game.Entity entity={entity}>
            <Suspense>
              <game.Component name="grass$">
                <Grass {...entity.grass} />
              </game.Component>
            </Suspense>
          </game.Entity>
        )}
      </game.Entities>
    </>
  )
}
