import { Euler, Object3D, Vector3 } from "three"

export function copyTransform(
  a: Object3D,
  b: {
    position: Vector3
    rotation: Euler
    scale: Vector3
    visible: boolean
  }
) {
  a.position.copy(b.position)
  a.rotation.copy(b.rotation)
  a.scale.copy(b.scale)
}
