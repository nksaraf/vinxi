import * as THREE from "three"
import React, { useId } from "react"
import { EntityTransformControls } from "./EntityTransformControls"
import { EntityEditor } from "./EntityEditor"
import tunnel from "tunnel-rat"
import { useEditor } from "."
import create from "zustand"
import { Leva } from "leva"
export const SidebarTunnel = tunnel()

export let useTunnels = create((set) => ({}))

function In({ children }) {
  const id = useId()
  let oldTunnel = useTunnels((state) => state[id])
  if (!oldTunnel) {
    oldTunnel = tunnel()
    useTunnels.setState({
      [id]: oldTunnel
    })
  }

  return <oldTunnel.In>{children}</oldTunnel.In>
}

export function EditorPanel() {
  const p = useEditor((state) => Object.values(state.elements))
  return (
    <>
      <In>
        <Leva
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
        {/* <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 100,
            background: "white",
            padding: 10
          }}
        >
          <pre>{JSON.stringify(Object.keys(p), null, 2)}</pre>
        </div> */}
      </In>
      {p.map((e) =>
        e.parentId === null ? <EntityEditor key={e.id} entity={e} /> : null
      )}
      {p.map((e) =>
        e.ref instanceof THREE.Object3D && e.parentId === null ? (
          <EntityTransformControls key={e.id} entity={e} />
        ) : null
      )}
    </>
  )
}
