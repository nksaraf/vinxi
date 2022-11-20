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
import EditorSystem from "vinxi/systems/editor"
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
function Systems() {
  return (
    <>
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
      {/* <TerrainSystem /> */}
      <EditorSystem />
    </>
  )
}

export const App = () => {
  return (
    <StartScreen>
      <GameCanvas>
        <Systems />
      </GameCanvas>
    </StartScreen>
  )
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
