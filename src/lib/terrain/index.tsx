import { Html, useTexture } from "@react-three/drei"
import { Grass, resolution, width } from "./grass"
import { game } from "vinxi/game"
import { useTreeModel } from "../../models/Tree"
import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import {
  InstancedBufferGeometry,
  InstancedMesh,
  Mesh,
  Object3D,
  PlaneGeometry,
  RawShaderMaterial,
  RepeatWrapping,
  Vector3
} from "three"
import { getYPosition, useHeightmap } from "../useHeightmap"
import { useNoiseTexture } from "../useNoiseTexture"

const players = game.world.with("controller", "transform")
export function Instances({ count = 100, temp = new Object3D() }) {
  const ref = useRef<InstancedMesh>(null)
  const heightmap = useHeightmap()

  useEffect(() => {
    // Set positions
    for (let i = 0; i < count; i++) {
      let x = Math.random() * 500 - 512 / 2
      let y = Math.random() * 500 - 512 / 2
      temp.position.set(
        x,
        getYPosition(heightmap!, x, y, 2.0, [512 / 2, 512 / 2]),
        y
      )
      temp.updateMatrix()
      ref.current!.setMatrixAt(i, temp.matrix)
    }
    // Update the instance
    ref.current!.instanceMatrix.needsUpdate = true
  }, [])
  const treeModel = useTreeModel()
  return (
    <>
      <instancedMesh
        ref={ref}
        args={[treeModel.geometry, treeModel.material, count]}
      ></instancedMesh>
      <Html></Html>
    </>
  )
}
export function GroundSystem() {
  let ref = useRef<Mesh<InstancedBufferGeometry, RawShaderMaterial>>(null)
  let groundRef = useRef<Mesh<PlaneGeometry, RawShaderMaterial>>(null)
  let noiseTexture = useNoiseTexture()
  let heightmap = useHeightmap()
  const groundGeometry = useMemo(() => {
    const geom = new PlaneGeometry(width, width, resolution, resolution)
    geom.lookAt(new Vector3(0, 1, 0))
    let attr = geom.getAttribute("position")
    for (var i = 0; i < attr.count; i++) {
      attr.setY(
        i,
        getYPosition(heightmap!, attr.getX(i), attr.getZ(i), 2.0, [
          512 / 2,
          512 / 2
        ])
      )
    }
    geom.computeVertexNormals()
    return geom
  }, [])

  useFrame(({ clock }, dt) => {
    let [player] = players
    if (!player || !ref.current || !groundRef.current) return
    ref.current.material.uniforms.time.value = clock.getElapsedTime() * 5

    ref.current.position.x = player.transform.position.x
    ref.current.position.z = player.transform.position.z

    // if (
    //   groundRef.current.position.z != player.sceneObject.position.z ||
    //   groundRef.current.position.x != player.sceneObject.position.x
    // ) {
    //   let x = player.sceneObject.position.x
    //   let y = player.sceneObject.position.z
    //   let attr = groundGeometry.getAttribute("position")
    //   for (var i = 0; i < attr.count; i++) {
    //     attr.setY(
    //       i,
    //       getYPosition(heightmap!, attr.getX(i) + x, attr.getZ(i) + y, 5.0, [
    //         512 / 2,
    //         512 / 2
    //       ])
    //     )
    //   }
    //   attr.needsUpdate = true
    //   groundGeometry.computeVertexNormals()
    //   // groundRef.current.position.x = player.sceneObject.position.x
    //   // groundRef.current.position.z = player.sceneObject.position.z
    // }
    ref.current.material.uniforms.posX.value = player.transform.position.x
    ref.current.material.uniforms.posZ.value = player.transform.position.z
    // groundRef.current.material.uniforms.posX.value =
    // player.sceneObject.position.x
    // groundRef.current.material.uniforms.posZ.value =
    // player.sceneObject.position.z
    // ref.current.visible = false
  })

  // useControls({
  //   scale: {
  //     value: 5.0,
  //     onChange(v) {
  //       // groundRef.current!.material.uniforms.scale.value = v
  //       ref.current!.material.uniforms.scale.value = v
  //     }
  //   },
  //   offset: {
  //     value: [width / 2, width / 2],
  //     onChange(v) {
  //       // groundRef.current!.material.uniforms.offsetX.value = v[0]
  //       // groundRef.current!.material.uniforms.offsetY.value = v[1]
  //       ref.current!.material.uniforms.offsetX.value = v[0]
  //       ref.current!.material.uniforms.offsetY.value = v[1]
  //     }
  //   }
  // })
  const texture = useTexture("/textures/grasslands.jpeg", (text) => {
    text.wrapS = text.wrapT = RepeatWrapping
  })

  return (
    <>
      <Grass
        offset={[512 / 2, 512 / 2]}
        ref={ref}
        noiseTexture={noiseTexture}
        scale={2.0}
      />
      <mesh ref={groundRef} geometry={groundGeometry} receiveShadow>
        {/* <GroundMaterial
              noiseTexture={noiseTexture}
              groundTexture={texture}
              scale={4.0}
              offset={[512 / 2, 512 / 2]}
              initialPosition={[0, 0]}
            /> */}
        <meshStandardMaterial map={texture} />
      </mesh>
    </>
  )
}
