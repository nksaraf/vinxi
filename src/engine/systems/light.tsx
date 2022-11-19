import { Html, PivotControls, Plane, Sphere } from "@react-three/drei"
import { DirectionalLight, DirectionalLightHelper } from "three"
import { Helper } from "../lib/Helper"
import { selectEntity, store } from "./editor"
import { useStore } from "statery"
import { DirectionalLightProps, useFrame } from "@react-three/fiber"
import { game, Layers } from "../game"
import { bitmask } from "render-composer"

export const directionalLights = game.world.with("directionalLight")
export const directionalLightObjects = game.world.with(
  "directionalLight$",
  "transform"
)

declare global {
  export interface Components {
    directionalLight?: DirectionalLightProps
    directionalLight$?: DirectionalLight
  }
}

export default function LightSystem() {
  const { editor } = useStore(store)
  useFrame(() => {
    for (const entity of directionalLightObjects) {
      entity.directionalLight$.position.copy(entity.transform.position)
      entity.directionalLight$.rotation.copy(entity.transform.rotation)
      entity.directionalLight$.scale.copy(entity.transform.scale)
    }
  })
  return (
    <game.Entities in={directionalLights}>
      {(entity) => (
        <>
          <game.Component name="directionalLight$">
            {/* <PivotControls> */}
            <directionalLight
              {...entity.transform}
              {...entity.directionalLight}
            />
            {/* </PivotControls> */}
          </game.Component>
          {editor && (
            <game.Component name="helper$">
              <Sphere
                layers-mask={bitmask(1)}
                scale={0.25}
                onPointerDown={(e) => {
                  e.stopPropagation()
                  selectEntity(entity)
                }}
              >
                <Html
                  style={{
                    userSelect: "none"
                  }}
                  pointerEvents="none"
                >
                  <span
                    style={{
                      fontSize: "1rem"
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      selectEntity(entity)
                    }}
                  >
                    💡
                  </span>
                </Html>
                <meshBasicMaterial color="black" />
              </Sphere>
            </game.Component>
          )}
          {editor && (
            <Helper
              entity={() => entity.directionalLight$}
              helper={DirectionalLightHelper}
            />
          )}
        </>
      )}
    </game.Entities>
  )
}
