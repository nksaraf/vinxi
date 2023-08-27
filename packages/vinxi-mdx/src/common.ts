export function mergeArrays<T>(a: T[] = [], b: T[] = []) {
  return a.concat(b).filter(Boolean)
}
