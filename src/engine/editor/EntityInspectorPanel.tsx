import { useStore } from "statery"
import { Leva } from "leva"
import { store } from "vinxi/editor/Editor"
import { useControls, folder } from "leva"
import { useFrame, useThree } from "@react-three/fiber"
import { memo, useState } from "react"
import { selectButton } from "./selectButton"
import { Stage } from "vinxi/configuration"
import { componentLibrary } from "./Editor"

export function EntityPanel() {
  const { editor } = useStore(store)
  return (
    <Leva
      hidden={!editor}
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

let i = 0

export const EntityControls = memo(({ entity }: { entity: Components }) => {
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
          ...controls
        },
        {
          color: "blue"
        }
      )
    }
  }, [entity, run])

  useControls(
    entity.name,
    {
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
      order: 1000
    }
  )

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
  }, Stage.Late)

  return null
})
