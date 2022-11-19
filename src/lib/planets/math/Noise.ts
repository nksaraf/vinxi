import { random } from "@hello-worlds/core"
import SimplexNoise from "simplex-noise"

export enum NOISE_STYLES {
  simplex = "simplex",
  // perlin = "perlin",
  // fbm = "fbm"
}

export interface NoiseParams {
  seed?: string | number
  scale: number
  height: number
  noiseType: NOISE_STYLES
  octaves: number
  persistence: number
  lacunarity: number
  exponentiation: number
}

export class Noise {
  private noiseFunctions: {
    [key: string]: {
      noise3D: (x: number, y: number, z: number) => number
    }
  }
  constructor(private params: NoiseParams) {
    const seed = this.params.seed || random

    this.noiseFunctions = {
      simplex: new SimplexNoise(seed),
    }
  }

  get(x: number, y: number, z: number) {
    const G = 2.0 ** -this.params.persistence
    const xs = x / this.params.scale
    const ys = y / this.params.scale
    const zs = z / this.params.scale
    const noiseFunc = this.noiseFunctions[this.params.noiseType]

    let amplitude = 1.0
    let frequency = 1.0
    let normalization = 0
    let total = 0
    for (let o = 0; o < this.params.octaves; o++) {
      const noiseValue =
        noiseFunc.noise3D(xs * frequency, ys * frequency, zs * frequency) *
          0.5 +
        0.5
      total += noiseValue * amplitude
      normalization += amplitude
      amplitude *= G
      frequency *= this.params.lacunarity
    }
    total /= normalization
    return Math.pow(total, this.params.exponentiation) * this.params.height
  }
}
