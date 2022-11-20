import { createThreadedPlanetWorker } from "@hello-worlds/planets"
import { Color } from "three"

// generate a smooth planet
import {
  ChunkGenerator3Initializer,
  DEFAULT_NOISE_PARAMS,
  Noise
} from "@hello-worlds/planets"

// const simpleHeight: ChunkGenerator3Initializer<
//   ThreadParams,
//   number,
//   { seed: string }
// > = ({ data: { seed }, radius }) => {
//   // create your global (haha) objects here!
//   // this function is ran once when the thread is spawned
//   const noise = new Noise({
//     ...DEFAULT_NOISE_PARAMS,
//     scale: radius / 100,
//     height: radius / 1000,
//     seed
//   })

//   return ({ input }) => {
//     // this will be ran for each vertex!
//     return noise.get(input.x, input.y, input.z)
//   }
// }

const simpleHeight: ChunkGenerator3Initializer<
  ThreadParams,
  number,
  { seed: string }
> = ({ data: { seed }, radius }) => {
  // create your global (haha) objects here!
  // this function is ran once when the thread is spawned
  // const noise = new Noise({
  //   ...DEFAULT_NOISE_PARAMS,
  //   scale: radius / 100,
  //   height: radius / 1000,
  //   seed
  // })

  return ({ input }) => {
    // this will be ran for each vertex!
    return 0
  }
}
// generate a color per-chunk
const simpleColor: ChunkGenerator3Initializer<ThreadParams, Color> = () => {
  const chunkColor = new Color(Math.random() * 0xffffff)
  return () => {
    return chunkColor
  }
}

createThreadedPlanetWorker<ThreadParams>({
  heightGenerator: simpleHeight,
  colorGenerator: simpleColor
})
