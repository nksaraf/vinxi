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
  buttonGroup,
  LevaPanel,
  useCreateStore,
  LevaStoreProvider,
  useStoreContext,
  folder
} from "leva"
import { DirectionalLightProps, useThree } from "@react-three/fiber"
import { Euler, Object3D, Vector3 } from "three"
import { TransformControls as TransformControlsImpl } from "three-stdlib"
import { useKeyboardShortcuts } from "./useKeyboardShortcuts"
import { useEffect } from "react"
import { usePersistedControls } from "../lib/usePersistedControls"
import { game } from "vinxi/game"
import { With } from "miniplex"
import { bitmask, Layers } from "render-composer"
import { SidebarTunnel } from "./tunnel"
import { EntityPanel, EntityControls } from "./EntityInspectorPanel"
import { Components, styled } from "leva/plugin"
import { entitiesPanel } from "./entitiesPanel"
import { EntityTransformControls } from "./EntityTransformControls"
import { Toaster } from "react-hot-toast"

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
  editor: false,
  store: null
})

export function selectEntity(entity: Components) {
  store.set(({ entities: selectedEntities }) => {
    return { entities: [entity] }
  })
}

export let i = 0

export const EntityLabel = styled("div", {
  color: "$highlight2",
  display: "flex",
  flexDirection: "flex-row",
  alignItems: "center",
  justifyContent: "space-between"
})

export default function Editor() {
  const { editor } = useStore(store)
  useKeyboardShortcuts()
  const entityStore = useCreateStore()
  store.set({ store: entityStore })

  const [{ grid, axis }, set] = usePersistedControls(
    "editor",
    {
      grid: true,
      axis: true,
      enabled: {
        value: true,
        onChange(v) {
          console.log("editor changed")
          store.set({
            editor: v
          })
        }
      }
    },
    {
      store: entityStore
    }
  )

  useControls(
    {
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
    },
    {
      store: entityStore
    }
  )
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
      <LevaStoreProvider store={entityStore}>
        <EditorControls />
        <EditorCamera />
      </LevaStoreProvider>
      <SidebarTunnel.In>
        <EntityPanel />
        <WorldPanel size={size} store={entityStore} />
        <Toaster position="bottom-right" />
      </SidebarTunnel.In>
      {grid && <gridHelper layers-mask={bitmask(1)} />}
      {axis && <axesHelper layers-mask={bitmask(1)} />}
      <GizmoHelper alignment={"bottom-right"}>
        <GizmoViewport />
      </GizmoHelper>
    </>
  ) : null
}

export function WorldPanel({
  size,
  store
}: {
  size: {
    width: number
    height: number
  }
  store: ReturnType<typeof useCreateStore>
}) {
  useControls(
    "world",

    { entities: entitiesPanel() },
    {
      store: store,
      order: 0
    }
  )

  return (
    <LevaPanel
      flat={false}
      store={store}
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
  const leva = useStoreContext()
  const [{ cameraPosition, cameraRotation }, set] = usePersistedControls(
    "editor",
    {
      cameraPosition: [10, 10, 10],
      cameraRotation: [0, 0, 0]
    },
    {
      store: leva
    }
  )
  return (
    <>
      <PerspectiveCamera
        layers-mask={bitmask(Layers.Default, 1)}
        position={cameraPosition}
        rotation={cameraRotation}
        makeDefault
      />
      <OrbitControls
        makeDefault
        onChange={(e) => {
          set({
            cameraPosition: e?.target.object.position.toArray(),
            cameraRotation: [
              e?.target.object.rotation.x,
              e?.target.object.rotation.y,
              e?.target.object.rotation.z
            ]
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

export let componentLibrary: {
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
