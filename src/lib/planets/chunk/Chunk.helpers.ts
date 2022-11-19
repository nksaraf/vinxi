import { Vector3 } from "three"
import { RingWorldRootChunkProps, RootChunkProps } from "./types"

export const makeRootChunkKey = (child: RootChunkProps) => {
  return (
    child.position.x +
    "/" +
    child.position.y +
    " [" +
    child.size +
    "]" +
    " [" +
    child.index +
    "]"
  )
}

export const makeRingWorldRootChunkKeySpread = (
  position: Vector3,
  width: number,
  height: number,
  index: number,
) => {
  return `${position.x}/${position.y}[${width}/${height}][${index}]`
}

export const makeRingWorldRootChunkKey = (root: RingWorldRootChunkProps) => {
  return makeRingWorldRootChunkKeySpread(
    root.position,
    root.width,
    root.height,
    root.index,
  )
}

export const makeRingWorldChildChunkKey = (width: number, height: number) => {
  return `[${width}/${height}]`
}
