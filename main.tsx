import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import "./assets/Ghost.gltf?gltfjsx"

import { StartScreen } from "./src/lib/StartScreen"
/* We need to make sure that this file imports _something_ from @react-three/fiber
because otherwise Vite gets confused. :( */
import "@react-three/fiber"
import { GameCanvas } from "vinxi/GameCanvas"
import { CameraSystem } from "vinxi/systems/camera"
import Editor, { store } from "vinxi/editor/Editor"
import RenderSystem from "vinxi/systems/render"
import { GLTFSystem } from "vinxi/systems/gltf"
import { ControlledMovementSystem } from "vinxi/systems/controller"
import MeshSystem from "vinxi/systems/mesh"
import { ScriptSystem } from "vinxi/systems/script"
import LightSystem from "vinxi/systems/light"
import { Instances, GroundSystem as TerrainSystem } from "./src/lib/terrain"
import { GridSystem } from "./src/scripts/grid"
import { TopDownControlledMovementSystem } from "./src/scripts/top-down-controller"
import { Vector3 } from "three"
import { Terrain } from "./src/scripts/Terrain"

import { MSDFTextGeometry, MSDFTextMaterial } from "vinxi/text/src"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js"
import * as THREE from "three"
import { useQuery } from "@tanstack/react-query"
import { Box } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { useControls } from "leva"

let p = Promise.all([
  loadFontAtlas(
    "https://raw.githubusercontent.com/leochocolat/msdf-font-factory/main/fonts/roboto-regular/output/roboto-regular.png"
  ),
  loadFont(
    "https://raw.githubusercontent.com/leochocolat/msdf-font-factory/main/fonts/roboto-regular/output/roboto-regular.fnt"
  )
]).then(([atlas, font]) => {
  const geometry = new MSDFTextGeometry({
    text: "Hello World",
    font: font.data
  })

  const material = new MSDFTextMaterial()
  material.uniforms.uMap.value = atlas
  material.side = THREE.DoubleSide

  return { material }
  const mesh = new THREE.Mesh(geometry, material)
  // mesh.rotation.x = Math.PI
  return mesh
})

function loadFontAtlas(path) {
  const promise = new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader()
    loader.load(path, resolve)
  })

  return promise
}

function loadFont(path) {
  const promise = new Promise((resolve, reject) => {
    const loader = new FontLoader()
    loader.load(path, resolve)
  })

  return promise
}

const Comp = () => {
  const { data } = useQuery({
    queryFn: () => p,
    queryKey: ["font"]
  })
  return <primitive object={data} />
}
function Systems() {
  return (
    <>
      <Editor />
      <GridSystem />
      <GLTFSystem />
      <ScriptSystem />
      <MeshSystem />
      <LightSystem />
      <CameraSystem />
      {/* <Instances /> */}
      <RenderSystem />
      <Terrain />
      {/* <ControlledMovementSystem /> */}
      <TopDownControlledMovementSystem />
      {/* <Comp /> */}
      {/* <TerrainSystem /> */}
    </>
  )
}

function A(props) {
  const ref = React.useRef()
  const { position } = useControls(
    props.name,
    {
      position: {
        value: [0, 0, 0],
        onChange(e) {
          fetch("/__editor/write", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              source: props._source,
              value: e
            })
          })
          ref.current?.position.set(...e)
        },
        step: 0.1
      }
    },
    {
      collapsed: true
    }
  )
  const scene = useThree()
  globalThis.scene = scene
  return (
    <Box
      ref={ref}
      {...props}
      position={position}
      onPointerDown={(e) => {
        console.log(e)
      }}
    />
  )
}
export const App = () => {
  return (
    <StartScreen>
      <GameCanvas>
        <A transform name="a" />
        <mesh />
        {/* <Systems /> */}
      </GameCanvas>
    </StartScreen>
  )
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
