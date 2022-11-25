import { Camera } from "three"

export const moveForward = (camera: Camera) => {
  camera.translateZ(-1)
}
