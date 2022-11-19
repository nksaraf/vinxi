import { Html } from "@react-three/drei"
import { forwardRef } from "react"
import { useMemo } from "react"
import { Euler, GridHelper, Vector3 } from "three"
import { game } from "vinxi/game"
import { Helper } from "vinxi/lib/Helper"
import { MeshComponent } from "vinxi/lib/MeshComponent"
import { selectEntity } from "vinxi/systems/editor"

let grids = game.world.with("grid")

const Grid = forwardRef(({ width, height, entity, cellSize = 5 }, ref) => {
  const array = useMemo(() => {
    let array = []
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        array.push([i, j])
      }
    }
    return array
  }, [width, height])

  return (
    <group ref={ref} onPointerDown={(e) => selectEntity(entity)}>
      {array.map(([x, y]) => (
        <>
          <mesh
            position={[x * cellSize, 0, y * cellSize]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => {
              console.log("click", x, y)
              game.world.add({
                transform: {
                  position: new Vector3(x * cellSize, 0, y * cellSize),
                  rotation: new Euler(0, 0, 0),
                  scale: new Vector3(5, 5, 5)
                },
                gltf: {
                  import:
                    "/assets/models/map/Houses_FirstAge_1_Level1.gltf?gltfjsx"
                }
              })
            }}
          >
            <planeGeometry args={[cellSize - 1, cellSize - 1]} />
            <meshStandardMaterial transparent opacity={0} />
            <Html transform zIndexRange={[10, 20]}>
              <span className="text-white text-2xl z-0">
                [{x}, {y}]
              </span>
            </Html>
          </mesh>
        </>
      ))}
    </group>
  )
})

class GridClass {
  constructor() {}
}

export function GridSystem() {
  return (
    <game.Entities in={grids}>
      {(entity) => {
        return (
          <game.Entity entity={entity}>
            <game.Component name="gltfMesh$">
              {/* <MeshComponent
                entity={entity}
                geometry={{
                  type: "planeGeometry",
                  props: {
                    args: [10, 10]
                  }
                }}
                material={{
                  type: "meshBasicMaterial",
                  props: {
                    color: "red"
                  }
                }}
              /> */}
              <Grid entity={entity} {...entity.grid} />
            </game.Component>
          </game.Entity>
        )
      }}
    </game.Entities>
  )
}
