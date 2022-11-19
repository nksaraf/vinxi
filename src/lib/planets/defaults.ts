import { getSeed } from "@hello-worlds/core"
import { NOISE_STYLES } from "./math/Noise"

export const DEFAULT_NOISE_PARAMS = {
  octaves: 13,
  persistence: 0.707,
  lacunarity: 1.8,
  exponentiation: 4.5,
  height: 300.0,
  scale: 1100.0,
  seed: getSeed(),
  noiseType: NOISE_STYLES.simplex,
}
