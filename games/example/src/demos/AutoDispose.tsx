import * as THREE from "three"
import React, { memo, useContext, useRef, useState } from "react"
import { Canvas, useFrame, useEditor, editable } from "@vinxi/editor/fiber"
import { Html } from "@react-three/drei"
import tunnel from "tunnel-rat"
import { Box2 } from "./Box2"
import { useThree } from "@react-three/fiber"
import { useControls, folder, useStoreContext } from "leva"

export const SidebarTunnel = tunnel()

export const EntityEditor = memo(({ entity }: { entity: any }) => {
  console.log(entity)
  const scene = useThree((s) => s.scene)
  const [run, setRun] = useState(0)
  function reset() {
    setRun((r) => r + 1)
  }
  const store = useStoreContext()
  const [, set] = useControls(() => {
    let name = entity.ref.name?.length
      ? entity.ref.name
      : `${entity.ref._source.moduleName}:${entity.ref._source.componentName}:${entity.type}:${entity.ref._source.lineNumber}:${entity.ref._source.columnNumber}`
    let controls = {}
    // Object.keys(entity).forEach((key) => {
    //   if (componentLibrary[key]) {
    //     controls = {
    //       ...controls,
    //       ...(componentLibrary[key]?.controls?.(entity as any, reset, scene) ??
    //         {})
    //     }
    //   }
    // })
    return {
      [name]: folder(
        {
          name: {
            value: name,
            onChange: (value) => {
              entity.name = value
            }
          },
          ...controls
        },
        {
          color: "white",
          ...(store ? { store } : {})
        }
      )
    }
  }, [entity, run])

  // useControls(
  //   entity.name,
  //   {
  //     newComponent: selectButton({
  //       options: Object.keys(componentLibrary).filter(
  //         (e) => !entity[e as keyof Components]
  //       ),
  //       onClick: (get: any) => {
  //         let componentType = get(name + ".newComponent")
  //         componentLibrary[componentType]?.addTo(entity)
  //         reset()
  //       }
  //     })
  //   },
  //   {
  //     order: 1000
  //   }
  // )

  // useFrame(function editorControlsSystem() {
  //   if (entity.transform) {
  //     set({
  //       // @ts-expect-error
  //       position: entity.transform.position.toArray(),
  //       rotation: [
  //         MathUtils.radToDeg(entity.transform.rotation.x),
  //         MathUtils.radToDeg(entity.transform.rotation.y),
  //         MathUtils.radToDeg(entity.transform.rotation.z)
  //       ],
  //       scale: entity.transform.scale.toArray()
  //     })
  //   }
  // }, Stage.Late)

  return null
})

function Box1(props: any) {
  const mesh = useRef<THREE.Mesh>(null!)
  const [hovered, setHover] = useState(false)
  useFrame(
    (state) => (mesh.current.position.y = Math.sin(state.clock.elapsedTime))
  )
  return (
    <editable.mesh
      {...props}
      ref={mesh}
      onClick={(e) => props.setActive(!props.active)}
      onPointerOver={(e) => setHover(true)}
      onPointerOut={(e) => setHover(false)}
    >
      <boxGeometry />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </editable.mesh>
  )
}

function EditorPanel() {
  const p = useEditor((state) => state.elements)
  globalThis.p = p
  console.log(p)
  return (
    <>
      <SidebarTunnel.In>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            background: "white",
            padding: 10
          }}
        >
          <pre>{JSON.stringify(p, null, 2)}</pre>
        </div>
      </SidebarTunnel.In>
      {Object.values(p).map((e) => (
        <EntityEditor key={e.id} entity={e} />
      ))}
    </>
  )
}

function Switcher() {
  const [active, setActive] = useState(false)
  return (
    <>
      {active && (
        <Box1 active={active} setActive={setActive} position={[-0.5, 0, 0]} />
      )}
      {!active && (
        <Box2 active={active} setActive={setActive} position={[0.25, 0, 0]} />
      )}
    </>
  )
}

export default function App() {
  return (
    <>
      <Canvas orthographic camera={{ zoom: 100 }}>
        <ambientLight />
        <Switcher />
        <EditorPanel />
      </Canvas>
      <SidebarTunnel.Out />
    </>
  )
}
