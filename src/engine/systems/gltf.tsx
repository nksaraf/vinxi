import { Suspense, useMemo, useRef, useState } from "react"
import { registerComponent, selectEntity } from "./editor"
import { folder } from "leva"
import { game } from "../game"
import { With } from "miniplex"
import { useAnimations, useGLTF, useHelper } from "@react-three/drei"
import { useLayoutEffect } from "react"
import { store } from "../systems/editor"
import { useFrame, useGraph } from "@react-three/fiber"
import { BoxHelper, Group } from "three"
import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { GLTFLoader, DRACOLoader } from "three-stdlib"
import { ScriptedEntity } from "./script"
declare global {
  export interface Components {
    gltf?: {
      url: string
    }
    gltf$?: {
      setUrl: (url: string) => void
    }
    gltfMesh$?: Group
  }
}

registerComponent("gltf", {
  addTo(e) {
    game.world.addComponent(e, "gltf", {
      url: "/Ghost.gltf"
    })
  },
  controls(entity) {
    return {
      gltf: folder(
        {
          url: {
            value: entity.gltf?.url,
            onChange: (value) => {
              entity.gltf.url = value
              if (entity.gltf$) {
                entity.gltf$.setUrl(value)
              }
            },
            transient: true
          }
        },
        {
          collapsed: true
        }
      )
    }
  }
})

const gltfs = game.world.with("gltf")

function Gltf({ entity }: { entity: With<Components, "gltf"> }) {
  if (entity.gltf.import) {
    return (
      <Suspense>
        <ScriptedEntity entity={entity} script={entity.gltf.import} />
      </Suspense>
    )
  }
  const [url, setUrl] = useState(entity.gltf.url)
  entity.gltf$ = { setUrl }
  return (
    <Suspense>
      <Model url={url} {...entity.gltf} />
    </Suspense>
  )
}
export function GLTFSystem() {
  useFrame(() => {
    for (var entity of gltfObjects) {
      entity.gltfMesh$.position.copy(entity.transform.position)
      entity.gltfMesh$.rotation.copy(entity.transform.rotation)
      entity.gltfMesh$.scale.copy(entity.transform.scale)
    }
  })

  return (
    <game.Entities in={gltfs}>
      {(entity) => (
        <game.Entity entity={entity}>
          <Suspense>
            <Gltf entity={entity} />
          </Suspense>
        </game.Entity>
      )}
    </game.Entities>
  )
}

const gltfObjects = game.world.with("gltfMesh$", "transform").without("physics")

export function Model({ url, ...props }: { url: string }) {
  const entity = game.useCurrentEntity()!
  const data = useGLTF(url)
  const group = useRef<Group>()
  let child = data.scene.children[0]
  const animations = useAnimations(data.animations, group)
  const clone = useMemo(() => child.clone(), [child])
  console.log(...data.scene.children, clone)

  useEffect(() => {
    entity.gltfMesh$ = clone
    console.log(data)
    entity.gltf$ = Object.assign(entity.gltf$ ?? {}, data)
    entity.mixer$ = animations
  }, [entity, clone, data])

  return (
    <game.Component name="gltfMesh$">
      <group
        ref={group}
        onPointerDown={(e) => {
          e.stopPropagation()
          selectEntity(entity)
        }}
      >
        <primitive object={clone} key={clone} />
      </group>
    </game.Component>
  )
}
