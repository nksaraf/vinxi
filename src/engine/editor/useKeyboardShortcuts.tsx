import { useEffect, useState } from "react"
import { serialize } from "../world"
import { store } from "./system"
import { useStore } from "statery"
import { game } from "../game"

export function useKeyboardShortcuts() {
  const { editor } = useStore(store)
  const [prev, setPrev] = useState(null)
  useEffect(() => {
    // listen for ctrl + S to save the scene
    const handleKeyDown = async (e) => {
      if (e.metaKey && e.key === "s") {
        e.preventDefault()
        console.log("saving scene")
        let message = serialize(game)
        await fetch("/__editor/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: "scenes/home.json",
            scene: message
          })
        })
        console.log(game.world.entities)
      }

      // listen for Space to play/pause the scene
      else if (e.key === " ") {
        e.preventDefault()
        if (editor) {
          setPrev(serialize(game))
          store.set((editor) => ({
            editor: !editor.editor
          }))
        } else {
          store.set((editor) => ({
            editor: !editor.editor
          }))
          let restore = JSON.parse(prev)
          restore.forEach((entity, i) => {
            let e = game.world.entities[i]
            Object.keys(entity).forEach((key) => {
              if (key === "transform") {
                e.transform.position.fromArray(entity[key].position)
                e.transform.rotation.fromArray(entity[key].rotation)
                e.transform.scale.fromArray(entity[key].scale)
              } else {
                e[key] = entity[key]
              }
            })
          })

          let len = restore.length
          for (let i = game.world.entities.length - 1; i >= len; i--) {
            game.world.remove(game.world.entities[i])
          }
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [editor, prev])
}
