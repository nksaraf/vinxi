import { useFrame } from "@react-three/fiber"
import { RigidBody, RigidBodyApi, useRigidBody } from "@react-three/rapier"
import React, { useEffect, useLayoutEffect } from "react"
import { useStore } from "statery"
import { Quaternion } from "three"
import { game } from "../game"
import { store } from "./editor"
import { MeshComponent } from "../lib/MeshComponent"

declare global {
  export interface Components {
    physics?: {}
    rigidBody$?: RigidBodyApi
  }
}

const physics = game.world.with("physics", "mesh", "transform")
const rigidBodies = game.world.with("transform", "rigidBody$")
const quat = new Quaternion()
export default function PhysicsSystem() {
  const { editor } = useStore(store)

  useFrame(() => {
    if (!editor) {
      for (const entity of rigidBodies) {
        entity.transform.position.copy(entity.rigidBody$.translation())
      }
    } else {
      for (const entity of rigidBodies) {
        entity.rigidBody$.setTranslation(entity.transform.position)
        quat.setFromEuler(entity.transform.rotation)
        entity.rigidBody$.setRotation(quat)
      }
    }
  })

  useLayoutEffect(() => {
    if (editor) {
      for (const entity of rigidBodies) {
        entity.rigidBody$.setAngvel({ x: 0, y: 0, z: 0 })
        entity.rigidBody$.setLinvel({ x: 0, y: 0, z: 0 })
      }
    }
  }, [editor])
  return (
    <>
      <game.Entities in={physics}>
        {(entity) => {
          return (
            <game.Component name="rigidBody$">
              <RigidBody
                {...(editor
                  ? {
                      enabledTranslations: [false, false, false],
                      enabledRotations: [false, false, false]
                    }
                  : {
                      enabledTranslations: [true, true, true],
                      enabledRotations: [true, true, true]
                    })}
                {...entity.transform}
                {...entity.physics}
              >
                <MeshComponent entity={entity} {...entity.mesh} />
              </RigidBody>
            </game.Component>
          )
        }}
      </game.Entities>
    </>
  )
}
