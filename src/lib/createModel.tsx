import { useGLTF, useAnimations } from "@react-three/drei"
import { GroupProps } from "@react-three/fiber"
import React, { useRef, useLayoutEffect, useImperativeHandle } from "react"
import { AnimationAction } from "three"

type ModelRef<T extends { nodes?: any; materials?: any; animations?: any }> = {
  group: THREE.Group
  nodes: T["nodes"]
  materials: T["materials"]
  animations: T["animations"]
  actions: { [k in T["animations"]["name"]]: AnimationAction }
  mixer: THREE.AnimationMixer
}

export function createModel<
  T extends { nodes?: any; materials?: any; animations?: any },
  P extends JSX.IntrinsicAttributes = GroupProps
>(
  path: string,
  fn: React.FC<
    {
      ref: React.MutableRefObject<THREE.Group>
      group: React.MutableRefObject<THREE.Group>
      nodes: T["nodes"]
      materials: T["materials"]
      animations: T["animations"]
      actions: { [k in T["animations"]["name"]]: AnimationAction }
    } & React.PropsWithChildren<P>
  >
) {
  let Model = React.forwardRef<ModelRef<T>, React.PropsWithChildren<P>>(
    (props, ref) => {
      let Component = fn
      const group = useRef<THREE.Group>()
      const { nodes, materials, animations } = useGLTF(path) as unknown as T
      const { actions, mixer } = useAnimations(animations, group)

      useLayoutEffect(() => {
        Object.assign(group.current, {
          nodes,
          materials,
          animations,
          actions,
          mixer
        })
      }, [])
      useImperativeHandle(ref, () => group.current)

      let internalProps = {
        group,
        nodes,
        materials,
        animations,
        actions,
        mixer,
        ...props
      }

      return Component(internalProps)
    }
  )

  return {
    Model,
    useRef() {
      return useRef<ModelRef<T>>(null as any)
    }
  }
}
