import { useTexture } from "@react-three/drei"
import { MeshProps, useThree } from "@react-three/fiber"
import React, { forwardRef, useLayoutEffect, useRef } from "react"
import mergeRefs from "react-merge-refs"
import { Mesh } from "three"
import { game } from "../game"
import { selectEntity, store } from "../systems/editor"

export const MeshComponent = forwardRef<
  Mesh,
  Omit<MeshProps, "geometry" | "material"> & {
    entity: any
    geometry: { type: string; props: any }
    material: { type: string; props: any }
  }
>(({ geometry, material, entity, ...props }, forwardedRef) => {
  const { texture } = useTexture(
    entity.assets?.map.url
      ? {
          texture: entity.assets.map.url
        }
      : {}
  )

  const ref = useRef()
  useLayoutEffect(() => {
    game.world.addComponent(entity, "mesh$", ref.current)
    return () => {
      game.world.removeComponent(entity, "mesh$")
    }
  }, [entity])
  const controls = useThree((state) => state.controls)
  console.log(controls)
  return (
    <mesh
      ref={mergeRefs([ref, forwardedRef])}
      {...props}
      onPointerDown={(e) => {
        console.log(e)
        const ent = store.state.entities[0]

        if (!ent) {
          selectEntity(entity)
          return
        } else if (ent.transformControls$ && !ent.transformControls$.axis) {
          console.log(e, ent.transformControls$.axis)
          selectEntity(entity)
        }
      }}
    >
      {React.createElement(geometry.type, geometry.props)}
      {React.createElement(material.type, {
        ...material.props,
        map: texture
      })}
    </mesh>
  )
})
