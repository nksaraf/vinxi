import { useFrame } from "@react-three/fiber"
import { useControls } from "leva"
import { useEntities } from "miniplex/react"
import { useRef } from "react"
import { useStore } from "statery"
import { Vector3, Quaternion } from "three"
import { lerp } from "three/src/math/MathUtils"
import { controller } from "../input"
import { game } from "../engine/game"
import { store } from "../engine/systems/editor"

declare global {
  export interface Components {
    controller?: {
      movement: {
        velocity: [number, number, number]
        acceleration: [number, number, number]
        decceleration: [number, number, number]
      }
    }
  }
}

const decceleration = new Vector3(-0.0005, -0.0001, -5.0)
const acceleration = new Vector3(1, 1, 50.0)
const turnSpeed = 10
const velocity = new Vector3()
const players = game.world.with("controller", "transform")
const quat = new Quaternion()

export function TopDownControlledMovementSystem() {
  const { editor } = useStore(store)
  useFrame((_, dt) => {
    if (editor) {
      return
    }
    let [player] = players
    if (!player) return
    velocity.set(...player.controller.movement.velocity)
    decceleration.set(...player.controller.movement.decceleration)
    acceleration.set(...player.controller.movement.acceleration)

    const { move, aim, fire } = controller.controls

    let forwardAcceleration = acceleration.z

    const frameDecceleration = new Vector3(
      velocity.x * decceleration.x,
      velocity.y * decceleration.y,
      velocity.z * decceleration.z
    )
    frameDecceleration.multiplyScalar(dt)
    frameDecceleration.z =
      Math.sign(frameDecceleration.z) *
      Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z))

    velocity.add(frameDecceleration)

    const _Q = new Quaternion()
    const _A = new Vector3()
    const _R = quat.setFromEuler(player.transform.rotation, true)

    if (fire) {
      forwardAcceleration *= 2
    }

    // if (this._stateMachine._currentState.Name == "dance") {
    //   acc.multiplyScalar(0.0)
    // }

    if (move.y > 0) {
      velocity.z += forwardAcceleration * dt
      _A.set(0, 1, 0)
      _R.setFromAxisAngle(_A, Math.PI)
    }
    if (move.y < 0) {
      velocity.z += forwardAcceleration * dt
      _A.set(0, 1, 0)
      _R.setFromAxisAngle(_A, 0)
    }
    if (move.x < 0) {
      _A.set(0, 1, 0)
      velocity.z += forwardAcceleration * dt
      _Q.setFromAxisAngle(_A, 4.0 * Math.PI * dt * acceleration.y)
      _R.setFromAxisAngle(_A, -Math.PI / 2)
    }
    if (move.x > 0) {
      _A.set(0, 1, 0)
      velocity.z += forwardAcceleration * dt
      _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * dt * acceleration.y)
      _R.setFromAxisAngle(_A, Math.PI / 2)
    }

    const forward = new Vector3(0, 0, 1)
    forward.applyQuaternion(_R)
    forward.normalize()

    const sideways = new Vector3(1, 0, 0)
    sideways.applyQuaternion(_R)
    sideways.normalize()

    sideways.multiplyScalar(velocity.x * dt)
    forward.multiplyScalar(velocity.z * dt)

    // controlObject.position.add(forward);
    // controlObject.position.add(sideways);

    player.transform.position.add(forward.add(sideways))
    player.transform.rotation.setFromQuaternion(_R)
    player.controller.movement.velocity = [velocity.x, velocity.y, velocity.z]

    // let y = getYPosition(
    //   heightmap!,
    //   controlObject.position.x,
    //   controlObject.position.z,
    //   scale,
    //   offset
    // );
    // controlObject.position.y = lerp(controlObject.position.y, y, dt * 3);

    // ref.current.position.copy(controlObject.position)
    // ref.current.position.y += 5

    // ref.current.quaternion.copy(
    //   new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), angle * Math.PI)
    // )
  })

  return (
    <>
      {/* <mesh ref={ref}>
        <boxGeometry />
      </mesh> */}
      {/* {zeroArray.map((a, i) =>
        zeroArray.map((a, j) => (
          <mesh
            position={[i * 32, getYPosition(memo, i * 32, j * 32, 2.0), j * 32]}
          >
            <boxGeometry />
          </mesh>
        ))
      )} */}
      {/* <NoisePlane
        scale={scale}
        imageData={memo}
        offset={offset}
        position={[512, 0, 512]}
      />
      <NoisePlane
        scale={scale}
        imageData={memo}
        offset={offset}
        position={[0, 0, 0]}
      />
      <NoisePlane
        scale={scale}
        imageData={memo}
        offset={offset}
        position={[-512, 0, -512]}
      />
      <NoisePlane
        scale={scale}
        imageData={memo}
        offset={offset}
        position={[0, 0, 512]}
      />

      <NoisePlane
        scale={scale}
        imageData={memo}
        offset={offset}
        position={[-512, 0, 0]}
      />
      <NoisePlane
        scale={scale}
        imageData={memo}
        offset={offset}
        position={[-512, 0, 512]}
      /> */}

      {/* <mesh position={[10, getYPosition(memo, 10, 10, 2.0), 10]}>
        <boxGeometry />
      </mesh>
      <mesh position={[20, getYPosition(memo, 20, 0, 2.0), 0]}>
        <boxGeometry />
      </mesh>
      <mesh position={[-20, getYPosition(memo, -20, 0, 2.0), 0]}>
        <boxGeometry />
      </mesh> */}
    </>
  )
}
