import React from "react"
import { useTunnels } from "./EditorPanel"

export function Outs() {
  const tunnel = useTunnels()

  return (
    <>
      {Object.entries(tunnel).map(([k, t]) => (
        <t.Out key={k} />
      ))}
    </>
  )
}
