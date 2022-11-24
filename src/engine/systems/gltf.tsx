import { Suspense, useMemo, useRef, useState } from "react"
import { registerComponent, selectEntity } from "../editor/Editor"
import { folder } from "leva"
import { game } from "../game"
import { With } from "miniplex"
import { useAnimations, useGLTF, useHelper } from "@react-three/drei"
import { useLayoutEffect } from "react"
import { store } from "../editor/Editor"
import { useFrame, useGraph } from "@react-three/fiber"
import { AnimationMixer, BoxHelper, Group } from "three"
import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { GLTFLoader, DRACOLoader } from "three-stdlib"
import { ScriptedEntity } from "./script"
import { copyTransform } from "vinxi/copyTransform"
import { Stage } from "vinxi/configuration"
declare global {
  export interface Components {
    gltf?: {
      url?: string
      import?: string
    }
    gltf$?: {
      nodes: {}
      materials: {}
      setUrl: (url: string) => void
    }
    mixer$?: ReturnType<typeof useAnimations>
    gltfMesh$?: Group
  }
}

export function GLTFSystem() {
  useFrame(() => {
    for (var entity of gltfObjects) {
      copyTransform(entity.gltfMesh$, entity.transform)
    }
  }, Stage.Render)

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
            value: entity.gltf?.url ?? entity.gltf?.import ?? "",
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
  const [url, setUrl] = useState(entity.gltf.url ?? entity.gltf.import ?? "")
  console.log(entity, url)
  if (entity.gltf.import) {
    return (
      <Suspense>
        <ScriptedEntity entity={entity} script={url} setUrl={setUrl} />
      </Suspense>
    )
  }
  return (
    <Suspense>
      <Model {...entity.gltf} url={url} setUrl={setUrl} />
    </Suspense>
  )
}

const gltfObjects = game.world.with("gltfMesh$", "transform").without("physics")

export function Model({
  url,
  setUrl,
  ...props
}: {
  url: string
  setUrl: (value: string) => void
}) {
  const entity = game.useCurrentEntity()!
  const data = useGLTF(url)
  const group = useRef<Group>(null)
  const animations = useAnimations(data.animations, group)

  useEffect(() => {
    entity.gltfMesh$ = data.scene
    entity.gltf$ = Object.assign(entity.gltf$ ?? {}, data, {
      setUrl: setUrl
    })
    entity.mixer$ = animations
  }, [entity, data, setUrl])

  return (
    <game.Component name="gltfMesh$">
      <group
        ref={group}
        onPointerDown={(e) => {
          e.stopPropagation()
          selectEntity(entity)
        }}
      >
        <primitive object={data.scene} key={data.scene.id} />
      </group>
    </game.Component>
  )
}
