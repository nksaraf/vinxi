import { GroupProps, RootState, useFrame } from "@react-three/fiber"
import { forwardRef, useImperativeHandle, useRef } from "react"
import { Group, Object3D } from "three"

export type AnimateUpdateCallback = (
  group: Group,
  dt: number,
  state: RootState
) => void

export type AnimateProps = GroupProps & {
  fun?: AnimateUpdateCallback
}

export const Animate = forwardRef<Group, AnimateProps>(
  ({ fun, ...props }, ref) => {
    const group = useRef<Group>(null!)

    useFrame((state, dt) => {
      fun?.(group.current, dt, state)
    })

    useImperativeHandle(ref, () => group.current)

    return <group ref={group} {...props} />
  }
)

export const rotate =
  (speedX: number, speedY: number, speedZ: number) =>
  (o: Object3D, dt: number) => {
    o.rotation.x += dt * speedX
    o.rotation.y += dt * speedY
    o.rotation.z += dt * speedZ
  }

export const float =
  (
    frequency: [number, number, number] = [1, 1, 1],
    amplitude: [number, number, number] = [1, 1, 1]
  ) =>
  (o: Object3D, dt: number, { clock }: RootState) => {
    o.position.x =
      Math.sin(clock.getElapsedTime() * frequency[0]) * amplitude[0]
    o.position.y =
      Math.sin(clock.getElapsedTime() * frequency[1]) * amplitude[1]
    o.position.z =
      Math.cos(clock.getElapsedTime() * frequency[2]) * amplitude[2]
  }
