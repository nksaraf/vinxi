import { bitmask, Layers } from "render-composer"
import { Environment } from "@react-three/drei"
import { useTexture } from "@react-three/drei"
import * as RC from "render-composer"
import { makeStore, useStore } from "statery"
import { Mesh } from "three"

const store = makeStore({
  sun: null as Mesh | null
})

useTexture.preload("/textures/lensdirt.jpg")

const PostProcessing = () => {
  const { sun } = useStore(store)
  const texture = useTexture("/textures/lensdirt.jpg")

  return (
    <RC.EffectPass>
      <RC.SMAAEffect />
      <RC.SelectiveBloomEffect intensity={4} luminanceThreshold={1} />
      {sun && <RC.GodRaysEffect lightSource={sun} />}
      <RC.LensDirtEffect texture={texture} />
      <RC.VignetteEffect />
    </RC.EffectPass>
  )
}

const Skybox = () => {
  return (
    <Environment
      background="only"
      files={[
        "/textures/skybox/right.png",
        "/textures/skybox/left.png",
        "/textures/skybox/top.png",
        "/textures/skybox/bottom.png",
        "/textures/skybox/front.png",
        "/textures/skybox/back.png"
      ]}
    />
  )
}

export default function World() {
  return (
    <>
      <PostProcessing />
      <Skybox />
      {/* <directionalLight
        position={[20, 20, 100]}
        intensity={1}
        shadow-mapSize-width={width}
        shadow-mapSize-height={heigth}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        castShadow
        layers-mask={bitmask(Layers.Default, Layers.TransparentFX)}
      /> */}
      <ambientLight
        intensity={0.1}
        layers-mask={bitmask(Layers.Default, Layers.TransparentFX)}
      />
    </>
  )
}
