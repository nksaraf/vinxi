import { TransformControls } from "@react-three/drei"
import { MathUtils } from "three"
import { TransformControls as TransformControlsImpl } from "three-stdlib"
import { useEffect, useRef } from "react"
import React from "react"
import { levaStore } from "leva"

export function EntityTransformControls({
  entity
}: // entity
{
  // entity: Components
}): JSX.Element {
  let ref = useRef<TransformControlsImpl>(null)
  useEffect(() => {
    //   if (ref.current) {
    //     ref.current.layers.mask = bitmask(Layers.Default, 1)
    //     // @ts-expect-error
    //     ref.current.raycaster.layers.mask = bitmask(Layers.Default, 1)
    //     // @ts-expect-error
    //     ref.current.camera.layers.mask = bitmask(Layers.Default, 1)
    //     ref.current.traverse((o) => {
    //       o.layers.mask = bitmask(Layers.Default, 1)
    //     })
    //   }

    function keyDown(event: KeyboardEvent) {
      let control = ref.current
      if (!control) return
      switch (event.keyCode) {
        case 16: // Shift
          control.setTranslationSnap(0.5)
          control.setRotationSnap(MathUtils.degToRad(15))
          control.setScaleSnap(0.25)
          break

        case 87: // W
          control.setMode("translate")
          break

        case 69: // E
          control.setMode("rotate")
          break

        case 82: // R
          control.setMode("scale")
          break

        case 187:
        case 107: // +, =, num+
          control.setSize(control.size + 0.1)
          break

        case 189:
        case 109: // -, _, num-
          control.setSize(Math.max(control - 0.1, 0.1))
          break

        case 88: // X
          control.showX = !control.showX
          break

        case 89: // Y
          control.showY = !control.showY
          break

        case 90: // Z
          control.showZ = !control.showZ
          break

        case 32: // Spacebar
          control.enabled = !control.enabled
          break

        case 27: // Esc
          control.reset()
          break
      }
    }
    window.addEventListener("keydown", keyDown)
    let keyUp = function (event) {
      let control = ref.current
      if (!control) {
        return
      }
      switch (event.keyCode) {
        case 16: // Shift
          control.setTranslationSnap(null)
          control.setRotationSnap(null)
          control.setScaleSnap(null)
          break
      }
    }

    window.addEventListener("keyup", keyUp)
    return () => {
      window.removeEventListener("keydown", keyDown)
      window.removeEventListener("keyup", keyUp)
    }
  })
  return (
    <TransformControls
      ref={(r) => {
        ref.current = r
        entity.transformControls$ = r
      }}
      onPointerDown={(e) => {}}
      key={entity.id}
      position={entity.ref.position}
      onChange={(c) => {
        if (c?.type === "change" && c.target.object && entity.ref) {
          // entity.ref.position.copy(c.target.object.position)
          // entity.ref.rotation.copy(c.target.object.rotation)
          // entity.ref.scale.copy(c.target.object.scale)

          entity.setTransformFromControls(c.target.object)

          // let state = levaStore.useStore.getState()

          // levaStore.useStore.setState({
          //   ...state,
          //   data: {
          //     ...state.data,
          //     [`${entity.name + ".transform.position"}`]: {
          //       ...state.data[`${entity.name + ".transform.position"}`],
          //       value: entity.controls?.transform?.schema.position.getValue()
          //     },
          //     [`${entity.name + ".transform.rotation"}`]: {
          //       ...state.data[`${entity.name + ".transform.rotation"}`],
          //       value: entity.controls?.transform?.schema.rotation.getValue()
          //     },
          //     [`${entity.name + ".transform.scale"}`]: {
          //       ...state.data[`${entity.name + ".transform.scale"}`],
          //       value: entity.controls?.transform?.schema.scale.getValue()
          //     }
          //   }
          // })
        }
      }}
    />
  )
}
