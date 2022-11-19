import * as UI from "ui-composer"
import { IEntity, Query, RegisteredEntity, World } from "miniplex"
import { useAutoRefresh } from "../../lib/useAutoRefresh"
import { game, Entity } from "../src/game"
import { Fragment } from "react"
import { Object3D, Quaternion, Vector3 } from "three"
import { RigidBodyApi } from "@react-three/rapier"

type MiniplexInspectorProps = {
  world: World
}
export const MiniplexInspector = ({ world }: MiniplexInspectorProps) => {
  useAutoRefresh(1 / 4)

  return (
    <UI.Panel>
      <UI.Heading>Miniplex ECS World</UI.Heading>

      <table cellPadding={3}>
        <tbody>
          <tr>
            <td align="right">{world.entities.length}</td>
            <td>Total Entities</td>
          </tr>
          {[...world.archetypes].map(([name, archetype], i) => (
            <tr key={i}>
              <td width={60} align="right">
                {archetype.entities.length}
              </td>
              <td>
                {archetype.query.map((component, i) => (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      backgroundColor: "#555",
                      borderRadius: "3px",
                      padding: "0 6px",
                      marginRight: "3px"
                    }}
                  >
                    {component}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </UI.Panel>
  )
}

export const MiniplexEntityInspector = <E extends IEntity>({
  entity
}: {
  entity: RegisteredEntity<E>
}) => {
  useAutoRefresh(1 / 10)

  return (
    <>
      {Object.entries(entity).map(([name, value]) => {
        switch (name) {
          case "player":
            return (
              <UI.Panel>
                <UI.Heading>Player (Tag)</UI.Heading>
              </UI.Panel>
            )
          case "sceneObject":
            const position = (value as Object3D).getWorldPosition(new Vector3())
            const rotation = (value as Object3D).getWorldQuaternion(
              new Quaternion()
            )
            return (
              <UI.Panel>
                <UI.Heading>Scene Object</UI.Heading>
                <UI.Control>
                  <UI.Label>Position</UI.Label>
                  <UI.HorizontalGroup align={"center"} gap>
                    X
                    <UI.Input
                      type="number"
                      value={position.x.toFixed(2)}
                      readOnly
                    />
                    Y
                    <UI.Input
                      type="number"
                      value={position.y.toFixed(2)}
                      readOnly
                    />
                    Z
                    <UI.Input
                      type="number"
                      value={position.z.toFixed(2)}
                      readOnly
                    />
                  </UI.HorizontalGroup>
                </UI.Control>
                <UI.Control>
                  <UI.Label>Rotation</UI.Label>
                  <UI.HorizontalGroup align={"center"} gap>
                    X
                    <UI.Input
                      type="number"
                      value={rotation.x.toFixed(2)}
                      readOnly
                    />
                    Y
                    <UI.Input
                      type="number"
                      value={rotation.y.toFixed(2)}
                      readOnly
                    />
                    Z
                    <UI.Input
                      type="number"
                      value={rotation.z.toFixed(2)}
                      readOnly
                    />
                  </UI.HorizontalGroup>
                </UI.Control>
              </UI.Panel>
            )
          case "rigidBody":
            const velocity = (value as RigidBodyApi).linvel()

            return (
              <UI.Panel>
                <UI.Heading>RigidBody</UI.Heading>
                <UI.Control>
                  <UI.Label>Velocity</UI.Label>
                  <UI.HorizontalGroup align={"center"} gap>
                    X
                    <UI.Input
                      type="number"
                      value={velocity.x.toFixed(2)}
                      readOnly
                    />
                    Y
                    <UI.Input
                      type="number"
                      value={velocity.y.toFixed(2)}
                      readOnly
                    />
                    Z
                    <UI.Input
                      type="number"
                      value={velocity.z.toFixed(2)}
                      readOnly
                    />
                  </UI.HorizontalGroup>
                </UI.Control>
              </UI.Panel>
            )
        }
      })}
    </>
  )
}

export const MiniplexArchetypeInspector = ({
  query
}: {
  query: Query<Entity>
}) => {
  const archetype = game.useArchetype(...query)

  return (
    <UI.Panel>
      <UI.Heading>Miniplex Archetype</UI.Heading>

      <div>
        {archetype.entities.map((entity, i) => (
          <div key={i}>Entity #{i}</div>
        ))}
      </div>
    </UI.Panel>
  )
}
