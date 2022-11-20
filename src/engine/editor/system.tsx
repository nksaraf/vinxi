import {
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  PerspectiveCamera
} from "@react-three/drei"
import { useStore } from "statery"
import { makeStore } from "statery"
import {
  useControls,
  folder,
  buttonGroup,
  LevaPanel,
  useCreateStore
} from "leva"
import { DirectionalLightProps, useFrame, useThree } from "@react-three/fiber"
import { Euler, Object3D, Vector3 } from "three"
import { TransformControls as TransformControlsImpl } from "three-stdlib"
import { useKeyboardShortcuts } from "./useKeyboardShortcuts"
import { memo, useEffect, useState } from "react"
import { usePersistedControls } from "../lib/usePersistedControls"
import { selectButton } from "./selectButton"
import { game } from "vinxi/game"
import { With } from "miniplex"
import { bitmask, Layers } from "render-composer"
import { SidebarTunnel } from "./tunnel"
import { EditorPanels } from "./EditorPanels"
import { Components, styled } from "leva/plugin"
import { entitiesPanel } from "./entitiesPanel"
import { EntityTransformControls } from "./EntityTransformControls"

declare global {
  export interface Components {
    transform?: {
      position: Vector3
      rotation: Euler
      scale: Vector3
      visible: boolean
    }
    name?: string
    active?: boolean
    directionalLight?: DirectionalLightProps
    helper$?: Object3D
    transformControls$?: TransformControlsImpl
  }
}

export const store = makeStore({
  entities: [] as Components[],
  editor: true
})

export function selectEntity(entity: Components) {
  store.set(({ entities: selectedEntities }) => {
    return { entities: [entity] }
  })
}

let i = 0

export const EntityLabel = styled("div", {
  color: "$highlight2",
  display: "flex",
  flexDirection: "flex-row",
  alignItems: "center",
  justifyContent: "space-between"
})

export default function EditorSystem() {
  const { editor } = useStore(store)
  useKeyboardShortcuts()

  const [{ grid, axis }, set] = usePersistedControls("editor", {
    grid: true,
    axis: true,
    camera: [10, 10, 10],
    enabled: {
      value: true,
      onChange(v) {
        console.log("editor changed")
        store.set({
          editor: v
        })
      }
    }
  })

  useControls({
    "add entity": buttonGroup({
      "🎥": () => {},
      "💡": () => {},
      "⏺️": () => {},
      "⏹️": () => {
        let e = game.world.add({
          transform: {
            position: new Vector3(0, 0, 0),
            rotation: new Euler(0, 0, 0),
            scale: new Vector3(1, 1, 1)
          },
          name: "unnamed" + i++,
          mesh: {
            geometry: {
              type: "boxGeometry",
              props: {
                args: [1, 1, 1]
              }
            },
            material: {
              type: "meshStandardMaterial",
              props: {
                color: "red"
              }
            }
          }
        })
        store.set({
          entities: [e]
        })
      }
    })
  })
  const raycaster = useThree((s) => s.raycaster)

  useEffect(() => {
    if (editor) {
      raycaster.layers.mask = bitmask(Layers.Default, 1)
    }

    set({
      // @ts-ignore
      enabled: editor
    })
    return () => {
      raycaster.layers.mask = bitmask(Layers.Default)
    }
  }, [editor, raycaster])
  const size = useThree((s) => s.size)

  return editor ? (
    <>
      <EditorControls />
      <EditorCamera />
      <SidebarTunnel.In>
        <EditorPanels />
        <ScenePanel size={size} />
      </SidebarTunnel.In>
      {grid && <gridHelper layers-mask={bitmask(1)} />}
      {axis && <axesHelper layers-mask={bitmask(1)} />}
      <GizmoHelper alignment={"bottom-right"}>
        <GizmoViewport />
      </GizmoHelper>
    </>
  ) : null
}

export function ScenePanel({
  size
}: {
  size: {
    width: number
    height: number
  }
}) {
  const entityStore = useCreateStore()

  useControls(
    {
      entities: entitiesPanel()
    },
    {
      store: entityStore
    }
  )

  return (
    <LevaPanel
      flat={false}
      store={entityStore}
      titleBar={{
        position: {
          x: -size.width + 300,
          y: 1
        }
      }}
      theme={{
        space: {
          rowGap: "2px",
          md: "10px"
        },
        sizes: {
          titleBarHeight: "28px"
        }
      }}
    />
  )
}

export function EditorCamera() {
  const [{ camera }, set] = usePersistedControls("editor", {
    camera: [10, 10, 10]
  })
  return (
    <>
      <PerspectiveCamera
        layers-mask={bitmask(Layers.Default, 1)}
        position={camera}
        makeDefault
      />
      <OrbitControls
        makeDefault
        onChange={(e) => {
          set({
            camera: e?.target.object.position.toArray()
          })
        }}
      />
    </>
  )
}

export function EditorControls() {
  const { entities } = useStore(store)
  return (
    <>
      {entities.map((entity) => (
        <EntityControls key={game.world.id(entity)} entity={entity} />
      ))}
      {entities.map((entity) => (
        <EntityTransformControls key={game.world.id(entity)} entity={entity} />
      ))}
    </>
  )
}

let componentLibrary: {
  [key: string]: Parameters<typeof registerComponent>[1]
} = {}

export function registerComponent<T extends keyof Components>(
  name: T,
  comp: {
    addTo(entity: Components): void
    controls(
      entity: With<Components, T>,
      reset: () => void,
      scene: THREE.Scene
    ): any
  }
) {
  // @ts-expect-error
  componentLibrary[name] = comp
}

const EntityControls = memo(({ entity }: { entity: Components }) => {
  console.log(entity)
  const scene = useThree((s) => s.scene)
  const [run, setRun] = useState(0)
  function reset() {
    setRun((r) => r + 1)
  }
  const [, set] = useControls(() => {
    let name = entity.name ?? "unnamed" + i++
    let controls = {}
    Object.keys(entity).forEach((key) => {
      if (componentLibrary[key]) {
        controls = {
          ...controls,
          ...(componentLibrary[key]?.controls?.(entity as any, reset, scene) ??
            {})
        }
      }
    })
    return {
      [name]: folder(
        {
          name: {
            value: name,
            onChange: (value) => {
              entity.name = value
            }
          },
          ...controls,
          newComponent: selectButton({
            options: Object.keys(componentLibrary).filter(
              (e) => !entity[e as keyof Components]
            ),
            onClick: (get: any) => {
              let componentType = get(name + ".newComponent")
              componentLibrary[componentType]?.addTo(entity)
              reset()
            }
          })
        },
        {
          color: "blue"
        }
      )
    }
  }, [entity, run])

  useFrame(function editorControlsSystem() {
    if (entity.transform) {
      set({
        // @ts-expect-error
        position: entity.transform.position.toArray(),
        rotation: [
          entity.transform.rotation.x,
          entity.transform.rotation.y,
          entity.transform.rotation.z
        ],
        scale: entity.transform.scale.toArray()
      })
    }
  })

  return null
})
