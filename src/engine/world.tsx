import { World as ECSWorld } from "miniplex"
import { createReactAPI } from "miniplex/react"
import { Euler, ObjectLoader, Vector3 } from "three"

export function create<T>(entities: (T & Components)[]) {
  const world = new ECSWorld<T & Components>(entities)
  const ECS = createReactAPI<T & Components>(world)
  return ECS
}

export function serialize(game: ReturnType<typeof create>) {
  return JSON.stringify(
    game.world.entities.map((entity) => {
      return Object.fromEntries(
        Object.keys(entity)
          .map((key): [string, any] => {
            if (key.endsWith("$")) {
              // @ts-expect-error
              return null
            }
            if (key === "transform" && entity.transform) {
              return [
                key,
                {
                  position: entity.transform.position?.toArray(),
                  rotation: entity.transform.rotation?.toArray(),
                  scale: entity.transform.scale?.toArray()
                }
              ]
            }

            if (
              typeof entity[key as keyof Components] === "object" &&
              entity[key as keyof Components]?.toJSON
            ) {
              // @ts-expect-error
              return [key + "$", entity[key].toJSON()]
            }
            // @ts-expect-error
            return [key, entity[key]]
          })
          .filter(Boolean)
      )
    }),
    null,
    2
  )
}

export function parse<T>(json: string) {
  const loader = new ObjectLoader()

  let d = JSON.parse(json, (key, value) => {
    if (key.endsWith("$")) {
      return loader.parse(value, console.log)
    }
    return value
  }).map((entity: any) => {
    return Object.fromEntries(
      Object.keys(entity).map((key) => {
        if (key === "transform") {
          return [
            key,
            {
              position: new Vector3().fromArray(entity[key].position),
              rotation: entity[key].rotation
                ? new Euler().fromArray(entity[key].rotation)
                : undefined,
              scale: entity[key].scale
                ? new Vector3().fromArray(entity[key].scale)
                : undefined
            }
          ]
        }

        if (key.endsWith("$")) {
          return [key.slice(0, -1), entity[key]]
        }

        return [key, entity[key]]
      })
    )
  })

  return create<{}>(d)
}
