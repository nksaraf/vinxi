import React, { Suspense, useEffect, useReducer } from "react"
import { Canvas, editable, EditorPanel } from "@vinxi/editor/fiber"
import { useLoader } from "@react-three/fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

let a = editable

function Test() {
  const [flag, toggle] = useReducer((state) => !state, true)
  useEffect(() => {
    const interval = setInterval(toggle, 1000)
    return () => clearInterval(interval)
  }, [])
  const { scene } = useLoader(
    GLTFLoader,
    flag ? "/Stork.glb" : "/Parrot.glb"
  ) as any
  return (
    <>
      <primitive object={scene} key={scene} />
    </>
  )
}
export default function App() {
  return (
    <Canvas>
      <ambientLight />
      <directionalLight position={[-1.4670737147982544, 1.8304460457201441, 0]} />
      <Suspense fallback={null}>
        <group position={[1.4287701010723781, -1.7700173094345695, 0]}>
          <Test />
        </group>
      </Suspense>
      <EditorPanel />
    </Canvas>
  );
}
