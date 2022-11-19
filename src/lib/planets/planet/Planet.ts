import { Group, Material, Vector2, Vector3 } from "three"
import { makeRootChunkKey } from "../chunk/Chunk.helpers"
import { ChunkMap, ChunkTypes, RootChunkProps } from "../chunk/types"
import { CubicQuadTree } from "../quadtree/CubicQuadTree"
import { dictDifference, dictIntersection } from "../utils"
import PlanetBuilder, { PlanetBuilderProps } from "./Planet.builder"

export interface PlanetProps<D> {
  radius: number
  inverted?: boolean
  minCellSize: number
  minCellResolution: number
  material?: Material
  position: Vector3
  workerProps: PlanetBuilderProps<D>["workerProps"]
  data: D
}

export class Planet<D = Record<string, any>> extends Group {
  #chunkMap: ChunkMap = {}
  #cubeFaceGroups = [...new Array(6)].map(_ => new Group())
  #builder: PlanetBuilder<D>
  readonly data: D
  material?: Material
  minCellSize: number
  minCellResolution: number
  radius: number
  inverted: boolean

  constructor({
    radius,
    minCellSize,
    minCellResolution,
    material,
    data,
    workerProps,
    position,
    inverted = false,
  }: PlanetProps<D>) {
    super()
    this.position.copy(position)
    this.#builder = new PlanetBuilder<D>({
      workerProps,
      data,
      radius,
      inverted,
    })
    this.radius = radius
    this.material = material
    this.minCellResolution = minCellResolution
    this.minCellSize = minCellSize
    this.data = data
    this.inverted = inverted
    this.add(...this.#cubeFaceGroups)
  }

  // this will cause all the chunks to reform
  // use this to update planet parameters
  rebuild() {
    this.#builder.rebuild(this.#chunkMap)
  }

  // this will resolve the LOD
  // you can call this each frame with a camera
  update(lodOrigin: Vector3) {
    this.#builder.update()
    if (this.#builder.busy) {
      return
    }

    const origin = this.position

    // update visible chunks quadtree
    const q = new CubicQuadTree({
      radius: this.radius,
      minNodeSize: this.minCellSize,
      origin,
    })

    // collapse the quadtree recursively at this position
    q.insert(lodOrigin)

    const sides = q.getChildren()

    let newChunkMap: ChunkMap = {}
    const center = new Vector3()
    const dimensions = new Vector3()
    for (let i = 0; i < sides.length; i++) {
      const cubeFaceRootGroup = this.#cubeFaceGroups[i]
      cubeFaceRootGroup.matrix = sides[i].transform // removed for floating origin
      cubeFaceRootGroup.matrixAutoUpdate = false
      for (let cubeFaceChildChunk of sides[i].children) {
        cubeFaceChildChunk.bounds.getCenter(center)
        cubeFaceChildChunk.bounds.getSize(dimensions)

        const cubeFaceRootChunk: RootChunkProps = {
          type: ChunkTypes.ROOT,
          index: i,
          group: cubeFaceRootGroup,
          transform: cubeFaceRootGroup.matrix,
          position: center.clone(),
          bounds: cubeFaceChildChunk.bounds.clone(),
          size: dimensions.x,
        }

        const key = makeRootChunkKey(cubeFaceRootChunk)
        newChunkMap[key] = cubeFaceRootChunk
      }
    }

    const intersection = dictIntersection(this.#chunkMap, newChunkMap)
    const difference = dictDifference(newChunkMap, this.#chunkMap)
    const recycle = Object.values(dictDifference(this.#chunkMap, newChunkMap))

    this.#builder.retireChunks(recycle)

    newChunkMap = intersection

    // Now let's build the children chunks who actually show terrain detail
    for (let key in difference) {
      const parentChunkProps = difference[key] as RootChunkProps
      const offset = parentChunkProps.position
      newChunkMap[key] = {
        type: ChunkTypes.CHILD,
        position: new Vector2(offset.x, offset.z),
        chunk: this.#builder.allocateChunk({
          group: parentChunkProps.group,
          material: this.material,
          offset,
          lodOrigin: lodOrigin,
          origin: this.position,
          width: parentChunkProps.size,
          height: parentChunkProps.size,
          radius: this.radius,
          resolution: this.minCellResolution,
          inverted: !!this.inverted,
        }),
      }
    }

    this.#chunkMap = newChunkMap
  }

  dispose() {
    this.#builder.dispose()
  }
}
