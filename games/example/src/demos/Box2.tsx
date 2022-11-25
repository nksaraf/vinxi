import * as THREE from "three"
import React, { useRef, useState } from "react"
import { useFrame, editable } from "@vinxi/editor/fiber"

export function Box2(props: any) {
  const mesh = useRef<THREE.Mesh>(null!)
  const [hovered, setHover] = useState(false)
  console.log("hello")
  console.log("hello")
  console.log("hello")
  useFrame(
    (state) => (mesh.current.position.y = Math.sin(state.clock.elapsedTime))
  )
  return (
    <group {...props}>
      <editable.mesh
        {...props}
        ref={mesh}
        onClick={(e) => props.setActive(!props.active)}
        onPointerOver={(e) => setHover(true)}
        onPointerOut={(e) => setHover(false)}
      >
        <editable.boxGeometry />
        <editable.meshStandardMaterial color={hovered ? "green" : "blue"} />
      </editable.mesh>
    </group>
  )
}
