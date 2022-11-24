import { Text } from "@react-three/drei"
import React from "react"

let sym = Symbol("A")

const useProp = (obj, prop) => {
  const [value, setValue] = React.useState(obj[prop])
  React.useEffect(() => {
    const onChange = (v) => setValue(v)
    obj[sym] = obj[sym] || {}
    obj[sym][prop] = obj[prop]
    Object.defineProperty(obj, prop, {
      set: (v) => {
        obj[sym][prop] = v
        onChange(v)
      },
      get: () => {
        return obj[sym][prop]
      }
    })
  }, [obj, prop])
  return value
}

class TriangleGeometry {
  
}

export function GridItem({ x, y, cellSize, grid }) {
  const prop = useProp(grid.grid[x][y], "placedEntity")
  return (
    <Text
      position={grid.getWorldPosition(x, y, 0.5)}
      // rotation={[-Math.PI / 2, 0, 0]}
      overflowWrap="break-word"
      fontSize={0.25}
    >
      {prop ? prop.name : ""}
    </Text>

    // <mesh
    //   position={grid.getWorldPosition(x, y)}
    //   rotation={[-Math.PI / 2, 0, 0]}
    //   scale={[cellSize, 1, cellSize]}
    //   geometry={plane}
    //   material={material}
    //   onClick={(e) => {
    //     console.log("click", x, y)
    //     game.world.add({
    //       transform: {
    //         position: grid.getWorldPosition(x, y),
    //         rotation: new Euler(0, 0, 0),
    //         scale: new Vector3(cellSize, 1, cellSize),
    //         visible: true
    //       },
    //       gltf: {
    //         import: "/assets/models/map/Houses_FirstAge_1_Level1.gltf?gltfjsx"
    //       }
    //     })
    //   }}
    // >
    //   {/* <Html transform zIndexRange={[10, 20]} pointerEvents="none">
    //    <span className="text-white text-2xl z-0">
    //      [{x}, {y}]
    //    </span>
    //  </Html> */}
    // </mesh>
  )
}
