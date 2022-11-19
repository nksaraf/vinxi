import { useTexture } from "@react-three/drei"
import { RepeatWrapping } from "three"

export function useNoiseTexture() {
  let noiseTexture = useTexture(
    // "/noise.jpg"
    "https://al-ro.github.io/images/grass/perlinFbm.jpg"
  )

  console.log(noiseTexture)
  noiseTexture.wrapS = RepeatWrapping
  noiseTexture.wrapT = RepeatWrapping
  return noiseTexture
}
