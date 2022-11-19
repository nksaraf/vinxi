import { registerComponent, store } from "./editor"
import React from "react"
import * as THREE from "three"
import { Mesh } from "three"
import { MeshComponent } from "../lib/MeshComponent"
import { folder, LevaInputs } from "leva"
import { useFrame } from "@react-three/fiber"
import { game } from "../game"

export const meshes = game.world.with("mesh")
export const meshObjects = game.world.with("mesh$", "transform")
// .without("physics")

// export const geometryWithoutMaterial = game.world
//   .with("geometry")
//   .without("material", "physics");

declare global {
  export interface Components {
    mesh?: {
      geometry: { type: string; props: any }
      material: { type: string; props: any }
    }
    mesh$?: Mesh
  }
}

registerComponent("mesh", {
  addTo(e) {
    game.world.addComponent(e, "mesh", {
      geometry: {
        type: "boxGeometry",
        props: { width: 1, height: 1, depth: 1 }
      },
      material: { type: "meshStandardMaterial", props: { color: "white" } }
    })
  },
  controls(entity, reset) {
    return {
      geometry: folder(
        {
          type: {
            options: ["box", "sphere", "cylinder", "cone", "plane"],
            value: entity.mesh.geometry?.type?.replace("Geometry", ""),
            onChange(e, path, { initial }) {
              if (initial) {
                return
              }
              console.log(e)
              entity.mesh.geometry.type = e + "Geometry"
              entity.mesh.geometry.props = {
                // args: [1, 1, 1],
              }

              let className = e[0].toUpperCase() + e.slice(1) + "Geometry"
              let mesh = entity.mesh$

              if (mesh.geometry) {
                mesh.geometry.dispose()
              }

              if (mesh) {
                mesh.geometry = new THREE[className]()
              }

              // game.world.remove(entity);
              // game.world.add(entity);
            }
          },
          widthSegments: {
            value: 1,
            render: null
          }
        },
        {
          collapsed: true
        }
      ),
      material: folder(
        {
          map: {
            image: "/textures/grass.jpeg",
            type: LevaInputs.IMAGE
          }
        },
        {
          collapsed: true
        }
      )
    }
  }
})

export default function MeshSystem() {
  useFrame(() => {
    for (var entity of meshObjects) {
      entity.mesh$.position.copy(entity.transform.position)
      entity.mesh$.rotation.copy(entity.transform.rotation)
      entity.mesh$.scale.copy(entity.transform.scale)
    }
  })
  return (
    <>
      <game.Entities in={meshes}>
        {(entity) => {
          let { geometry, material, ...props } = entity.mesh
          return <MeshComponent entity={entity} {...entity.mesh} />
        }}
      </game.Entities>
    </>
  )
}
