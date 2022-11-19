import { Color, Vector3 } from "three"

export const dictIntersection = <T = Record<string, any>>(
  dictA: T,
  dictB: T,
) => {
  // @ts-ignore
  const intersection: T = {}
  for (let k in dictB) {
    if (k in dictA) {
      intersection[k] = dictA[k]
    }
  }
  return intersection
}

export const dictDifference = <T = Record<string, any>>(dictA: T, dictB: T) => {
  const diff = { ...dictA }
  for (let k in dictB) {
    delete diff[k]
  }
  return diff
}

export const tempVector3 = new Vector3()
export const tempColor = new Color()

export const NOOP = () => {
  // noop, required sometimes by TS
}
