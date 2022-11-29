import React, { useState, useRef } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import {
  Canvas,
  EditorPanel,
  editable,
  createEditable
} from "@vinxi/editor/fiber"
import { useDrag } from "@use-gesture/react"

function Obj({ scale = 1, z = 0, opacity = 1 }) {
  const { viewport } = useThree()
  const [position, set] = useState<[number, number, number]>([0, 0, z])
  const bind = useDrag(({ event, offset: [x, y] }) => {
    event.stopPropagation()
    const aspect = viewport.getCurrentViewport().factor
    set([x / aspect, -y / aspect, z])
  })

  const mesh = useRef<THREE.Mesh>()

  useFrame(() => {
    mesh.current!.rotation.x = mesh.current!.rotation.y += 0.01
  })

  return (
    <mesh
      ref={mesh}
      position={position}
      {...(bind() as any)}
      onClick={(e) => {
        e.stopPropagation()
        console.log("clicked", { z })
      }}
      castShadow
      scale={scale}
    >
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        transparent
        opacity={opacity}
        color={true ? "hotpink" : "orange"}
      />
    </mesh>
  )
}

export default function App() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight
        position={[-2.4399271422146533, 3.803432130025085, -10]}
        rotation={[0, 0, -2.6328271305614925]}
        scale={[2.2026192455468485, 1.464348903812175, 1]}
      />
      {/* <Obj z={-1} scale={0.5} /> */}
      <Obj opacity={0.8} />
      <EditorPanel />
    </Canvas>
  )
}
