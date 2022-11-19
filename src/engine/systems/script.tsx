import { lazy, Suspense, useMemo } from "react"
import { game } from "../game"

let map = {}
export function ScriptedEntity({ entity, script }) {
  const Component = useMemo(() => {
    if (map[script]) return map[script]
    console.log(script)
    let el = lazy(() => import(/* @vite-ignore */ script))
    map[script] = el
    return el
  }, [entity, script])
  return <Component entity={entity} game={game} />
}
const scripts = game.world.with("script")
export function ScriptSystem() {
  return (
    <game.Entities in={scripts}>
      {(entity) => (
        <game.Entity entity={entity}>
          <Suspense>
            <ScriptedEntity entity={entity} script={entity.script} />
          </Suspense>
        </game.Entity>
      )}
    </game.Entities>
  )
}
