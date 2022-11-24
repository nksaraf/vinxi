import React from "react"
import { Planet } from "../lib/planets/react"
import worker from "./terrain-worker?worker"
import { RepeatWrapping, Vector3 } from "three"
import { useFrame } from "@react-three/fiber"
import { game } from "vinxi/game"
import { useTexture } from "@react-three/drei"

const players = game.world.with("controller")
const vel = new Vector3(0, 0, 0)

export function Terrain() {
  useFrame(() => {
    const [player] = players
    vel.copy(player.transform.position)
  })
  const map = useTexture("/assets/textures/factory_floor.jpeg")
  map.wrapS = RepeatWrapping
  map.wrapT = RepeatWrapping
  map.repeat.set(100, 100)
  return (
    <Planet
      worker={worker}
      lodOrigin={vel}
      radius={10000}
      data={{
        seed: 1
      }}
      minCellResolution={64}
      minCellSize={10}
      position={new Vector3(0, -10000, 0)}
    >
      <meshStandardMaterial map={map} />
    </Planet>
  )
}
