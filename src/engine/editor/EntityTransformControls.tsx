import { TransformControls } from "@react-three/drei"
import { MathUtils } from "three"
import { TransformControls as TransformControlsImpl } from "three-stdlib"
import { useEffect, useRef } from "react"
import { game } from "../game"
import { bitmask, Layers } from "render-composer"

export function EntityTransformControls({
  entity
}: {
  entity: Components
}): JSX.Element {
  let ref = useRef<TransformControlsImpl>(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.layers.mask = bitmask(Layers.Default, 1)
      // @ts-expect-error
      ref.current.raycaster.layers.mask = bitmask(Layers.Default, 1)
      // @ts-expect-error
      ref.current.camera.layers.mask = bitmask(Layers.Default, 1)
      ref.current.traverse((o) => {
        o.layers.mask = bitmask(Layers.Default, 1)
      })
    }

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
    <game.Entity entity={entity}>
      <game.Component name="transformControls$">
        <TransformControls
          ref={ref}
          onPointerDown={(e) => {}}
          key={game.world.id(entity)}
          {...entity.transform}
          onChange={(c) => {
            if (c?.type === "change" && c.target.object && entity.transform) {
              entity.transform.position
                ? entity.transform.position.copy(c.target.object.position)
                : (entity.transform.position = c.target.object.position)
              entity.transform.rotation
                ? entity.transform.rotation.copy(c.target.object.rotation)
                : (entity.transform.rotation = c.target.object.rotation)
              entity.transform.scale
                ? entity.transform.scale.copy(c.target.object.scale)
                : (entity.transform.scale = c.target.object.scale)
            }
          }}
        />
      </game.Component>
    </game.Entity>
  )
}
