import { MathUtils } from "three"
import Chunk, { ChunkProps } from "../chunk/Chunk"
import {
  ChildChunkProps,
  ChunkBuilderThreadedMessage,
  ChunkBuilderThreadedMessageTypes,
  ChunkMap,
  ChunkTypes,
  RootChunkProps,
} from "../chunk/types"
import { NOOP } from "../utils"
import WorkerThreadPool from "../worker/WorkerThreadPool"

export interface PlanetBuilderProps<D> {
  workerProps: {
    worker: new () => Worker
    numWorkers: number
  }
  radius: number
  inverted: boolean
  data: D
}

export default class PlanetBuilder<D> {
  // we keep the chunks stored with key of width
  #pool: Record<number, Chunk[]> = {}
  #old: (RootChunkProps | ChildChunkProps<Chunk>)[] = []
  #workerPool: WorkerThreadPool<ChunkBuilderThreadedMessage>
  public id: string = MathUtils.generateUUID()

  constructor({
    workerProps: { numWorkers, worker },
    ...buildChunkInitialProps
  }: PlanetBuilderProps<D>) {
    this.#workerPool = new WorkerThreadPool(numWorkers, worker)
    this.#workerPool.workers.forEach(worker => {
      const msg = {
        subject: ChunkBuilderThreadedMessageTypes.INITIAL_DATA,
        buildChunkInitialProps,
        id: this.id,
      }
      worker.postMessage(msg, NOOP)
    })
  }

  get old() {
    return this.#old
  }

  get busyLength() {
    return this.#workerPool.busyLength
  }

  get queueLength() {
    return this.#workerPool.queueLength
  }

  #onResult(chunk: Chunk, msg: any) {
    if (msg.subject === ChunkBuilderThreadedMessageTypes.BUILD_CHUNK_RESULT) {
      chunk.rebuildMeshFromData({ ...msg.data })
      chunk.show()
    }
  }

  allocateChunk(params: ChunkProps) {
    const w = params.width

    if (!(w in this.#pool)) {
      this.#pool[w] = []
    }

    let c: Chunk | null = null
    if (this.#pool[w].length > 0) {
      c = this.#pool[w].pop()!
      // apply new properties to this chunk
      // like width, etc
      Object.assign(c, params)
    } else {
      c = new Chunk(params)
    }

    c.hide()

    const threadedParams = {
      width: params.width,
      offset: params.offset,
      radius: params.radius,
      origin: params.origin,
      resolution: params.resolution,
      worldMatrix: params.group.matrix,
      inverted: params.inverted,
    }

    const msg = {
      subject: ChunkBuilderThreadedMessageTypes.BUILD_CHUNK,
      params: threadedParams,
      id: this.id,
    }

    this.#workerPool.enqueue(msg, response => {
      if (c) {
        return void this.#onResult(c, response)
      }
    })

    return c
  }

  retireChunks(recycle: (RootChunkProps | ChildChunkProps<Chunk>)[]) {
    this.#old.push(...recycle)
  }

  #recycleChunks(oldChunks: (RootChunkProps | ChildChunkProps<Chunk>)[]) {
    for (let chunk of oldChunks) {
      if (chunk.type === ChunkTypes.ROOT) {
        // we never get rid of roots!
        return
      }
      const childChunk = chunk as unknown as ChildChunkProps<Chunk>
      if (!(childChunk.chunk.width in this.#pool)) {
        this.#pool[childChunk.chunk.width] = []
      }
      childChunk.chunk.dispose()
    }
  }

  get busy() {
    return this.#workerPool.busy
  }

  rebuild(chunkMap: ChunkMap) {
    for (let key in chunkMap) {
      const chunk = chunkMap[key]
      if (chunk.type === ChunkTypes.CHILD) {
        const { material: _prevMaterial, ...params } = chunk.chunk

        const threadedParams = {
          width: params.width,
          offset: params.offset,
          radius: params.radius,
          origin: params.origin,
          resolution: params.resolution,
          worldMatrix: params.group.matrix,
          invert: params.inverted,
        }

        const msg = {
          subject: ChunkBuilderThreadedMessageTypes.BUILD_CHUNK,
          params: threadedParams,
          id: this.id,
        }

        this.#workerPool.enqueue(msg, response => {
          if (chunk) {
            return void this.#onResult(chunk.chunk, response)
          }
        })
      }
    }
  }

  update() {
    if (!this.busy) {
      this.#recycleChunks(this.#old)
      this.#old = []
    }
  }

  dispose() {
    this.#workerPool.workers.forEach(worker => {
      worker.dispose()
    })
  }
}
