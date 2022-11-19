import * as THREE from "three"
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef
} from "react"
import { useGLTF, useAnimations } from "@react-three/drei"
import { GLTF } from "three-stdlib"
import { createStateMachine } from "state-composer"
import { useFrame, useThree } from "@react-three/fiber"
import { controller } from "../input"

// merge React refs
const mergeRefs = (...refs) => {
  const filteredRefs = refs.filter(Boolean)
  if (!filteredRefs.length) return null
  if (filteredRefs.length === 1) return filteredRefs[0]
  return (value) => {
    filteredRefs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value)
      } else {
        ref.current = value
      }
    })
  }
}

type GLTFResult = GLTF & {
  nodes: {
    Cube001: THREE.SkinnedMesh
    Cube001_1: THREE.SkinnedMesh
    Cube001_2: THREE.SkinnedMesh
    Root: THREE.Bone
  }
  materials: {
    Ghost_Main: THREE.MeshStandardMaterial
    Eye_Black: THREE.MeshStandardMaterial
    Eye_White: THREE.MeshStandardMaterial
  }
  animations: { name: ActionName }
}

type ActionName =
  | "Death"
  | "Fast_Flying"
  | "Flying_Idle"
  | "Headbutt"
  | "HitReact"
  | "No"
  | "Punch"
  | "Yes"
type GLTFActions = Record<ActionName, THREE.AnimationAction>

export const Ghost = forwardRef(
  (props: JSX.IntrinsicElements["group"], ref) => {
    const group = useRef<THREE.Group>()
    const { nodes, materials, animations } = useGLTF(
      "/Ghost.gltf"
    ) as unknown as GLTFResult
    const { actions, mixer } = useAnimations(animations, group)

    useLayoutEffect(() => {
      group.current.actions = actions
    })
    return (
      <group ref={mergeRefs(group, ref)} {...props} dispose={null}>
        <group name="Scene">
          <group name="CharacterArmature">
            <primitive object={nodes.Root} />
            <group name="Ghost">
              <skinnedMesh
                name="Cube001"
                geometry={nodes.Cube001.geometry}
                material={materials.Ghost_Main}
                skeleton={nodes.Cube001.skeleton}
              />
              <skinnedMesh
                name="Cube001_1"
                geometry={nodes.Cube001_1.geometry}
                material={materials.Eye_Black}
                skeleton={nodes.Cube001_1.skeleton}
              />
              <skinnedMesh
                name="Cube001_2"
                geometry={nodes.Cube001_2.geometry}
                material={materials.Eye_White}
                skeleton={nodes.Cube001_2.skeleton}
              />
            </group>
          </group>
        </group>
      </group>
    )
  }
)

useGLTF.preload("/Ghost.gltf")
