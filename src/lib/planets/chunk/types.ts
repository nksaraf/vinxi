import THREE, { Box3, Color, Matrix4, Object3D, Vector3 } from "three"
import Chunk from "./Chunk"

export enum ChunkTypes {
  ROOT = "ROOT",
  CHILD = "CHILD",
}

// These root chunks host the interior children chunks
export interface RootChunkProps {
  index: number
  type: ChunkTypes.ROOT
  size: number
  group: Object3D
  position: Vector3
  transform: Matrix4
  bounds: Box3
}

export interface RingWorldRootChunkProps extends Omit<RootChunkProps, "size"> {
  width: number
  height: number
}

// These are the nested child nodes that live in the quadtree
export interface ChildChunkProps<C> {
  type: ChunkTypes.CHILD
  position: THREE.Vector2
  chunk: C
}

export type ChunkMap<Root = RootChunkProps> = Record<
  string,
  Root | ChildChunkProps<Chunk>
>

export enum ChunkBuilderThreadedMessageTypes {
  INITIAL_DATA = "INITIAL_DATA",
  BUILD_CHUNK_RESULT = "BUILD_CHUNK_RESULT",
  BUILD_CHUNK = "BUILD_CHUNK",
  GET_ELEVATION_AT_POSITION = "GET_ELEVATION_AT_POSITION",
}

export interface ChunkBuilderThreadedMessage {
  subject: ChunkBuilderThreadedMessageTypes
  data: any
  id: string
}

export interface ChunkGeneratorProps<D> {
  input: Vector3
  data: D
  worldPosition: Vector3
  width: number
  offset: Vector3
  radius: number
  resolution: number
  inverted: boolean
  origin: Vector3
  worldMatrix: Object3D["matrix"]
}

export type ChunkGenerator3<D, Output = number, E = {}> = (
  params: ChunkGeneratorProps<D> & E,
) => Output

export type ChunkGenerator3Initializer<D, Output = number, E = {}, P = {}> = (
  params: GeneratorInitialParams<D> & P,
) => ChunkGenerator3<D, Output, E>

export type HeightGeneratorInitializer<D> = ChunkGenerator3Initializer<
  D,
  number
>
export type ColorGeneratorInitializer<D> = ChunkGenerator3Initializer<
  D,
  Color | ColorArrayWithAlpha,
  { height: number }
>
export type HeightGenerator<D> = ChunkGenerator3<D, number>
export type ColorGenerator<D> = ChunkGenerator3<
  D,
  Color | ColorArrayWithAlpha,
  { height: number }
>

export interface GeneratorInitialParams<D> {
  radius: number
  inverted: boolean
  data: D
}

// it's strange that three doesn't have an alpha color
export type ColorArrayWithAlpha = [r: number, g: number, b: number, a: number]

export interface BuildChunkInitialParams<D> {
  colorGenerator?: ColorGenerator<D>
  heightGenerator: HeightGenerator<D>
}
