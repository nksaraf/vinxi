import React, {
  ComponentProps,
  forwardRef,
  useCallback,
  useId,
  useEffect,
  useLayoutEffect,
  useMemo,
  useContext
} from "react"
import { levaStore, useControls } from "leva"
import { mergeRefs } from "leva/plugin"
import {
  Canvas as FiberCanvas,
  useFrame as useFiberFrame
} from "@react-three/fiber"
import create from "zustand"
import { EditorContext, SceneElementContext } from "./EditorContext"
import { MathUtils, Object3D } from "three"
import { Outs } from "./Outs"
import { TransformControls } from "three-stdlib"

type Elements = {
  [K in keyof JSX.IntrinsicElements]: React.FC<
    JSX.IntrinsicElements[K] & {
      ref?: React.Ref<any>
    }
  >
}

export const createEditorStore = () => {
  const store = create((set, get) => ({
    elements: {} as { [key: string]: EditableElement }
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

export class EditableElement<P = {}> extends EventTarget {
  children: string[] = []
  props: any = {}
  ref: any | null = null
  dirty: any = {}

  transformControls$?: TransformControls
  constructor(
    public id: string,
    public source: {
      fileName: string
      lineNumber: number
      columnNumber: number
      moduleName: string
      componentName: string
    },
    public type: keyof JSX.IntrinsicElements | React.FC<P>,
    public parentId?: string | null
  ) {
    super()
  }

  get sourceName() {
    return `${this.source.moduleName}:${this.source.componentName}:${
      typeof this.type === "string"
        ? this.type
        : this.type.displayName || this.type.name
    }:${this.source.lineNumber}:${this.source.columnNumber}`
  }

  get name() {
    return this.ref?.name?.length ? this.ref.name : this.sourceName
  }

  set name(v: string) {
    if (this.ref) {
      this.ref.name = v
    }
  }

  setProp(prop: string, value: any) {
    // this.props[prop] = value
  }

  setTransformFromControls(object: Object3D) {
    this.ref.position.copy(object.position)
    this.ref.rotation.copy(object.rotation)
    this.ref.scale.copy(object.scale)
    this.setLevaControls({
      "transform.position": {
        value: this.position
      },
      "transform.rotation": {
        value: this.rotation
      },
      "transform.scale": {
        value: this.scale
      }
    })
  }

  setPositionFromPanel(position: [number, number, number]) {
    this.ref.position.set(...position)
  }

  get position() {
    return this.ref?.position.toArray()
  }

  get rotation() {
    return [
      MathUtils.radToDeg(this.ref.rotation.x),
      MathUtils.radToDeg(this.ref.rotation.y),
      MathUtils.radToDeg(this.ref.rotation.z)
    ]
  }

  get scale() {
    return this.ref?.scale.toArray()
  }

  setLevaControls(controls: any) {
    let state = levaStore.useStore.getState()

    let newControls = {}
    for (let key in controls) {
      let id = `${this.name}.${key}`
      newControls[id] = {
        ...state.data[id],
        ...controls[key]
      }
    }
    console.log(newControls)

    levaStore.useStore.setState({
      ...state,
      data: {
        ...state.data,
        ...newControls
      }
    })
  }
}

export function Editable({ component, ...props }) {
  console.log(component)
  const mainC = useMemo(() => {
    if (!memo[component]) {
      memo[component] = createEditable(component)
    }
    return memo[component]
  }, [memo, component])
  const isEditor = useContext(EditorContext)
  if (isEditor) {
    return React.createElement(mainC, props)
  }
  return React.createElement(component, props)
}

function useRerender() {
  const [, rerender] = React.useState(0)
  return useCallback(() => rerender((i) => i + 1), [rerender])
}

export function createEditable<K extends keyof JSX.IntrinsicElements, P = {}>(
  componentType: K | React.FC<P>
) {
  let hasRef =
    // @ts-ignore
    typeof componentType === "string" ||
    componentType.$$typeof === Symbol.for("react.forward_ref")

  if (hasRef) {
    return forwardRef<
      JSX.IntrinsicElements[K]["ref"],
      JSX.IntrinsicElements[K]
    >(function Editable(
      props: JSX.IntrinsicElements[K]["ref"] & { _source?: any },
      forwardRef
    ) {
      const { children, ...rest } = props
      const useEditorStore = React.useContext(EditorContext)
      const parentId = React.useContext(SceneElementContext)
      const ref = React.useRef()
      const id = useId()

      let source = props._source
      const editableElement = useMemo(() => {
        return new EditableElement<P>(id, source, componentType)
      }, [id])

      editableElement.id = id
      editableElement.parentId = parentId
      editableElement.type = componentType
      editableElement.source = props._source
      editableElement.props = null

      useLayoutEffect(() => {
        editableElement.ref = ref.current
      }, [editableElement, ref])

      useEffect(() => {})

      useLayoutEffect(() => {
        useEditorStore?.setState(({ elements }) => {
          if (elements[id] instanceof EditableElement) {
            elements[id] = editableElement
          } else if (elements[id]?.children) {
            elements[id].children.push(id)
            editableElement.children = [...elements[id].children]
            elements[id] = editableElement as EditableElement
          } else {
            elements[id] = editableElement
          }

          if (parentId) {
            if (elements[parentId]) {
              elements[parentId].children.push(id)
            } else {
              elements[parentId] = {
                children: [id]
              } as any
            }
          }

          return {
            elements: {
              ...elements
            }
          }
        })

        return () => {
          useEditorStore?.setState((el) => {
            // Do Cleanup
            // let e = {
            //   ...el.elements
            //   // [parent]: {
            //   //   ...(el.elements[parent] ?? {}),
            //   //   children: el.elements[parent]?.children.filter(
            //   //     (c) => c !== id
            //   //   )
            //   // }
            // }
            // if (el.elements[parentId]) {
            //   el.elements[parentId] = {
            //     ...(el.elements[parentId] ?? {}),
            //     children: e[parentId]?.children.filter((c) => c !== id)
            //   }
            // }
            // delete e[id]
            // return { elements: e }
          })
        }
      }, [parentId, id, editableElement])

      return React.createElement(SceneElementContext.Provider, {
        value: id,
        children: React.createElement(
          componentType,
          { ...rest, ref: mergeRefs([ref, forwardRef]) },
          children
        )
      })
    })
  } else {
    return function Editable(props) {
      const { children, ...rest } = props
      const useEditorStore = React.useContext(EditorContext)
      const parentId = React.useContext(SceneElementContext)
      const id = useId()
      const render = useRerender()

      const editableElement = useMemo(() => {
        return new EditableElement<P>(id, props._source, componentType)
      }, [id])

      editableElement.id = id
      editableElement.parentId = parentId
      editableElement.type = componentType
      editableElement.render = render
      editableElement.currentProps = props
      editableElement.source = props._source

      const memo = editableElement
      // useMemo(
      //   () => ({
      //     id,
      //     children: [],
      //     parent: parentId,
      //     type: key,
      //     props: {},
      //     render
      //   }),
      //   [parentId, key, render]
      // )

      useEffect(() => {
        memo.source = props._source
      }, [props._source, memo])

      useEffect(() => {
        if (props.position || props.rotation || props.scale) {
          memo.ref = new Object3D()
          if (props.position) {
            memo.ref.position.set(...props.position)
          }
          if (props.rotation) {
            memo.ref.rotation.set(...props.rotation)
          }
          if (props.scale) {
            memo.ref.scale.set(...props.scale)
          }
        }
      }, [])

      useEffect(() => {
        if (parentId) {
          useEditorStore?.setState((el) => ({
            elements: {
              ...el.elements,
              [id]: Object.assign(memo, el.elements[id]),
              [parentId]: {
                ...(el.elements[parentId] ?? {}),
                children: [...(el.elements[parentId]?.children ?? []), id]
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

              if (e[parentId]) {
                e[parentId] = {
                  ...(el.elements[parentId] ?? {}),
                  children: e[parentId]?.children.filter((c) => c !== id)
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
              [id]: Object.assign(memo, el.elements[id])
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
      }, [parentId, memo])
      return React.createElement(SceneElementContext.Provider, {
        value: id,
        children: React.createElement(
          componentType,
          { ...rest, ...(memo.props ?? {}) },
          children
        )
      })
    }
  }
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
  ComponentProps<typeof FiberCanvas> & { editor?: React.ReactNode }
>(function Canvas({ children, ...props }, ref) {
  const store = useMemo(() => createEditorStore(), [])
  console.log(store.getState())
  return React.createElement(
    React.Fragment,
    {},
    React.createElement(FiberCanvas, {
      ...props,
      ref,
      children: React.createElement(
        EditorContext.Provider,
        {
          value: store
        },
        children
      )
    }),
    React.createElement(Outs)
  )
})

export const useFrame = useFiberFrame

export { SidebarTunnel, EditorPanel } from "./EditorPanel"
