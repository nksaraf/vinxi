import { createThreadedPlanetWorker } from "@hello-worlds/planets"
import { Color } from "three"

// generate a smooth planet
const simpleHeight: ChunkGenerator3Initializer<ThreadParams, number> = (
  data
) => {
  return () => {
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
