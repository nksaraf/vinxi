import React, {
  ComponentProps,
  forwardRef,
  useId,
  useLayoutEffect,
  useMemo
} from "react"
import { useControls } from "leva"
import { mergeRefs } from "leva/plugin"
import {
  Canvas as FiberCanvas,
  useFrame as useFiberFrame
} from "@react-three/fiber"
import create from "zustand"
import { EditorContext, SceneElementContext } from "./EditorContext"

type Elements = {
  [K in keyof JSX.IntrinsicElements]: React.FC<
    JSX.IntrinsicElements[K] & {
      ref?: React.Ref<any>
    }
  >
}

export const createEditorStore = () => {
  const store = create((set, get) => ({
    elements: {} as Elements
  }))
  return store
}

const memo = {} as unknown as Elements

export function useEditor(
  ...args: Parameters<ReturnType<typeof createEditorStore>>
) {
  const useEditorStore = React.useContext(EditorContext)
  if (!useEditorStore) {
    throw new Error("useEditorStore must be used within a EditorProvider")
  }
  return useEditorStore(...args)
}

function createEditable<K extends keyof JSX.IntrinsicElements>(key: K) {
  return forwardRef<JSX.IntrinsicElements[K]["ref"], JSX.IntrinsicElements[K]>(
    function Editable(props, forwardRef) {
      const { children, ...rest } = props
      const useEditorStore = React.useContext(EditorContext)
      const parent = React.useContext(SceneElementContext)
      const controls = useControls({
        position: [0, 0, 0]
      })
      const ref = React.useRef()
      const id = useId()

      useLayoutEffect(() => {
        if (parent) {
          useEditorStore?.setState((el) => ({
            elements: {
              ...el.elements,
              [id]: {
                id,
                ref: ref.current,
                children: [],
                parent: parent,
                type: key
              },
              [parent]: {
                ...(el.elements[parent] ?? {}),
                children: [...(el.elements[parent]?.children ?? []), id]
              }
            }
          }))

          return () => {
            useEditorStore?.setState((el) => {
              let e = {
                ...el.elements
                // [parent]: {
                //   ...(el.elements[parent] ?? {}),
                //   children: el.elements[parent]?.children.filter(
                //     (c) => c !== id
                //   )
                // }
              }

              if (e[parent]) {
                e[parent] = {
                  ...(el.elements[parent] ?? {}),
                  children: e[parent]?.children.filter((c) => c !== id)
                }
              }

              delete e[id]
              return { elements: e }
            })
          }
        } else {
          useEditorStore?.setState((el) => ({
            elements: {
              ...el.elements,
              [id]: {
                ...el.elements[id],
                id,
                ref: ref.current,
                children: [],
                parent: null,
                type: key
              }
            }
          }))
          return () => {
            useEditorStore?.setState((el) => {
              let e = { ...el }
              delete e.elements[id]
              return e
            })
          }
        }
      }, [ref, parent, id])
      return React.createElement(SceneElementContext.Provider, {
        value: id,
        children: React.createElement(
          key,
          { ...rest, ref: mergeRefs([ref, forwardRef]) },
          children
        )
      })
    }
  )
}

export const editable = new Proxy(memo, {
  get: <K extends keyof JSX.IntrinsicElements>(target: Elements, key: K) => {
    const value = target[key]
    if (value) {
      return value
    }
    const newValue = createEditable(key)
    target[key] = newValue as any
    return newValue
  }
})

export const Canvas = forwardRef<
  HTMLCanvasElement,
  ComponentProps<typeof FiberCanvas>
>(function Canvas({ children, ...props }, ref) {
  const store = useMemo(() => createEditorStore(), [])
  return React.createElement(FiberCanvas, {
    ...props,
    ref,
    children: React.createElement(
      EditorContext.Provider,
      {
        value: store
      },
      children
    )
  })
})

export const useFrame = useFiberFrame
