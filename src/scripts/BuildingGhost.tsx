import { useEffect, useLayoutEffect, useRef } from "react"
import {
  BackSide,
  BoxHelper,
  FrontSide,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  TextureLoader,
  Vector3
} from "three"
import { game } from "vinxi/game"
import { store } from "vinxi/editor/Editor"
import { useFrame, useThree } from "@react-three/fiber"
import { useKeyboard } from "vinxi/lib/useKeyboard"
import { useControls } from "leva"
import { useStore } from "statery"
import { grids } from "./grid"
var vec = new Vector3() // create once and reuse
var pos = new Vector3() //

import { buildingSystem } from "./buildingSystem"
import { placeObjects } from "./placeObjects"

export default function BuildingGhost({ entity }: { entity: Components }) {
  const controls = useControls(
    "Building Ghost",
    {
      orbect: ""
    },
    {
      render: () => {
        return store.state.entities.includes(entity)
      }
    }
  )

  const { objectType, state } = useStore(buildingSystem)
  useEffect(() => {
    entity.gltf$?.setUrl(placeObjects[objectType].create({}).gltf.import)
  }, [entity, objectType])

  // const query = useQuery({
  //   queryKey: ["buildingGhost"],
  //   queryFn: () => {
  //     return new Promise((res, rej) => {
  //       loadFont(
  //         `https://cdn.aframe.io/fonts/SourceCodePro.fnt`,
  //         function (err, font) {
  //           console.log(err, font)
  //           // create a geometry of packed bitmap glyphs,
  //           // word wrapped to 300px and right-aligned
  //           var geometry = createGeometry({
  //             width: 500,
  //             align: "left",
  //             font: font
  //           })

  //           // change text and other options as desired
  //           // the options sepcified in constructor will
  //           // be used as defaults
  //           geometry.update("Lorem ipsum\nDolor sit amet.")

  //           // the resulting layout has metrics and bounds
  //           console.log(geometry.layout.height)
  //           console.log(geometry.layout.descender)

  //           // the texture atlas containing our glyphs
  //           var textureLoader = new TextureLoader()
  //           textureLoader.load(
  //             "https://cdn.aframe.io/fonts/SourceCodePro.png",
  //             function (texture) {
  //               // we can use a simple ThreeJS material
  //               var material = new MeshBasicMaterial({
  //                 map: texture,
  //                 transparent: true,
  //                 color: 0xaaffff
  //               })
  //               // material.side = BackSide

  //               // now do something with our mesh!
  //               var mesh = new Mesh(geometry, material)
  //               mesh.scale.set(0.01, -0.01, -0.01)
  //               mesh.rotation.set(-Math.PI / 2, 0, 0)
  //               console.log(mesh)
  //               res(mesh)
  //             }
  //           )
  //         }
  //       )
  //     })
  //   }
  // })

  const raycaster = useThree((s) => s.raycaster)

  useKeyboard({
    onKeyDown(e) {
      if (["1", "2", "3"].includes(e.key)) {
        console.log(entity)
        buildingSystem.set({
          objectType: Object.keys(placeObjects)[Number(e.key) - 1]
        })
      }
      if (e.key === 'KeyR') {

      }
    }
  })

  useFrame((three) => {
    if (state !== "building") {
      entity.gltfMesh$.visible = false
      return
    }

    entity.gltfMesh$.visible = true

    vec.set(three.pointer.x, 0.5, three.pointer.y)

    entity.gltfMesh$?.traverse((t) => {
      if ((t as Mesh).isMesh) {
        ;(t as Mesh).material.color.set(0x5555ff)
      }
    })

    let [grid] = grids
    if (grid && grid.gltfMesh$) {
      let intersect = raycaster.intersectObject(grid.gltfMesh$, true)
      if (intersect.length > 0) {
        let point = intersect[0].point
        console.log(
          point.x,
          point.z,
          Math.floor(point.x / grid.grid.cellSize),
          Math.floor(point.z / grid.grid.cellSize)
        )
        pos.set(
          Math.floor(point.x / grid.grid.cellSize) * grid.grid.cellSize +
            grid.grid.cellSize / 2,
          0,
          Math.floor(point.z / grid.grid.cellSize) * grid.grid.cellSize +
            grid.grid.cellSize / 2
        )

        entity.transform.position.lerp(pos, 0.25)
      }
      // vec.unproject(camera)
      // vec.sub(camera.position).normalize()
      // var distance = -camera.position.y / vec.y
      // pos.copy(camera.position).add(vec.multiplyScalar(distance))
      // console.log(pos, entity, distance)
    }
  })

  return null
}
