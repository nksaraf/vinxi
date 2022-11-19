import { useCallback } from "react"
import { IState, Store } from "statery"

export const useCapture = <S extends IState, K extends keyof S>(
  store: Store<S>,
  key: K
) =>
  useCallback((value: S[K]) => store.set({ [key]: value } as S), [store, key])
