import { useEffect, useState } from "react"
import { EyeClosedIcon, EyeOpenIcon, TrashIcon } from "@radix-ui/react-icons"
import { game } from "../game"
import { createPlugin, useInputContext } from "leva/plugin"
import { EntityLabel, selectEntity } from "./system"

export const entitiesPanel = createPlugin({
  normalize(input) {
    return { value: "", settings: input }
  },
  component: () => {
    const a = useInputContext()
    const [input, setInput] = useState(0)

    useEffect(() => {
      game.world.onEntityAdded.add((e) => setInput((i) => i + 1))
      game.world.onEntityRemoved.add((e) => setInput((i) => i + 1))
    }, [])
    return (
      <div>
        {game.world.entities.map((entity) => (
          <EntityItem entity={entity} key={game.world.id(entity)} />
        ))}
      </div>
    )
  }
})
function EntityItem({ entity }: { entity: Components }): JSX.Element {
  const [visible, setVisible] = useState(true)
  return (
    <EntityLabel>
      <span
        style={{
          marginLeft: "4px"
        }}
        onClick={(e) => {
          selectEntity(entity)
        }}
      >
        {entity.name}
      </span>
      <div className="flex flex-row space-x-1">
        <span
          onClick={(e) => {
            setVisible((v) => !v)
            if (entity.mesh$) {
              entity.mesh$.visible = !entity.mesh$.visible
            }
            if (entity.gltfMesh$) {
              entity.gltfMesh$.visible = !entity.gltfMesh$.visible
            }
          }}
        >
          {visible ? <EyeOpenIcon /> : <EyeClosedIcon />}
        </span>
        <span
          onClick={(e) => {
            game.world.remove(entity)
          }}
        >
          <TrashIcon />
        </span>
      </div>
    </EntityLabel>
  )
}
