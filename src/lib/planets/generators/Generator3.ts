export interface Generator3<T = number> {
  get(x: number, y: number, z: number): T
}
