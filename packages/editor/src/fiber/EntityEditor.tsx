import * as THREE from "three"
import { memo, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import {
  useControls,
  folder,
  useStoreContext,
  button,
  levaStore,
  LevaInputs
} from "leva"
import { MathUtils, Object3D } from "three"
import { EditableElement } from "."

import { createRPCClient } from "vite-dev-rpc"

const client = createRPCClient("vinxi", import.meta.hot, {})

const eq = {
  array: (a, b) => a.every((i, index) => i === b[index]),
  angles: (a, b) =>
    a.every((i, index) => Math.round(i) === Math.round(b[index]))
}
const getControls = (entity: EditableElement) => {
  let controls = {}
  if (entity.ref instanceof Object3D) {
    Object.assign(controls, {
      transform: folder(
        {
          position: {
            lock: true,
            step: 0.1,
            value: entity.ref.position.toArray(),

            onChange: (value, path, context) => {
              // if (value && context.fromPanel) {
              //   entity.setPositionFromPanel(value)
              // }
              if (!value) {
                return null
              }

              console.log(value, path, context)
              if (!eq.array(value, entity.ref.position.toArray())) {
                entity.ref.position.fromArray(value)
              }
              // @ts-ignore
              entity.transformControls$?.object?.position.fromArray(value)
              if (entity.props) {
                entity.props.position = value
                entity.render()
              }
            }
          },
          rotation: {
            lock: true,
            step: 1,
            value: entity.rotation,

            onChange: (value) => {
              if (!value) {
                return
              }

              value = value.map((v) =>
                typeof v === "string" ? Number(v.substring(0, v.length - 1)) : v
              )

              let rad = value.map((v) => MathUtils.degToRad(v))
              let euler = [...rad, "XYZ"]

              if (!eq.array(rad, entity.ref.rotation.toArray())) {
                entity.ref.rotation.fromArray(euler)
              }

              entity.transformControls$?.object?.rotation.fromArray(euler)

              if (entity.props) {
                entity.props.rotation = rad
                entity.render()
              }
            }
          },
          scale: {
            lock: true,
            step: 0.1,
            type: LevaInputs.VECTOR3D,
            value: entity.scale,
            onChange: (value) => {
              if (!value) {
                return
              }
              if (typeof entity.ref?.__r3f?.memoizedProps.scale === "number") {
                console.log(entity.ref.__r3f.memoizedProps.scale)
                // levaStore.useStore.setState(({ data }) => ({
                //   data: {
                //     ...data,
                //     [`${entity.name}.transform.scale`]: {
                //       ...data[`${entity.name}.transform.scale`],
                //       locked: true
                //     }
                //   }
                // }))
                levaStore.setSettingsAtPath(`${entity.name}.transform.scale`, {
                  locked: true
                })
                console.log(levaStore.useStore.getState())
              }
              entity.ref.scale.fromArray(value)
              entity.transformControls$?.object?.scale.fromArray(value)
              if (entity.props) {
                entity.props.scale = value
                entity.render()
              }
            }
          },
          visible: {
            value: entity.ref.visible,
            onChange: (value) => {
              entity.setProp("visible", value)
              entity.ref.visible = value
            }
          }
        },
        {
          collapsed: false
        }
      )
    })
  } else if (entity.ref?.isMaterial) {
    Object.assign(controls, {
      material: folder({
        wireframe: {
          value: entity.ref.wireframe,
          onChange(v) {
            entity.ref.wireframe = v
            // entity.render()
          }
        },
        color: {
          value: entity.ref.color.getStyle(),
          onChange(v) {
            entity.ref.color.setStyle(v)
            // entity.render()
          }
        }
      })
    })
  }

  return controls
}

const savedProps = (get, entity: any) => {
  if (entity.ref instanceof Object3D) {
    const store = levaStore.useStore.getState()
    return {
      position: !eq.array(
        store.data[`${entity.name}.transform.position`].value,
        [0, 0, 0]
      )
        ? store.data[`${entity.name}.transform.position`].value.map((v) =>
            Number(v.toFixed(3))
          )
        : undefined,
      rotation: !eq.array(
        store.data[`${entity.name}.transform.rotation`].value,
        [0, 0, 0]
      )
        ? store.data[`${entity.name}.transform.rotation`].value.map((i) =>
            MathUtils.degToRad(i)
          )
        : undefined,
      scale: !eq.array(
        store.data[`${entity.name}.transform.scale`].value,
        [1, 1, 1]
      )
        ? store.data[`${entity.name}.transform.scale`].value
        : undefined

      // scale: get(`${entity.name}.transform.scale`),
      // rotation: get(`${entity.name}.transform.rotation`).map((i) =>
      //   MathUtils.degToRad(i)
      // )
    }
  } else if (entity.ref?.isMaterial) {
    return {
      wireframe: get(`${entity.name}.material.wireframe`)
    }
  }
}
export const EntityEditor = memo(({ entity }: { entity: EditableElement }) => {
  console.log(entity)
  const scene = useThree((s) => s.scene)
  const [run, setRun] = useState(0)
  function reset() {
    setRun((r) => r + 1)
  }
  const store = useStoreContext()
  const [, set] = useControls(() => {
    let name = entity.name
    let controls = getControls(entity)
    // Object.keys(entity).forEach((key) => {
    //   if (componentLibrary[key]) {
    //     controls = {
    //       ...controls,
    //       ...(componentLibrary[key]?.controls?.(entity as any, reset, scene) ??
    //         {})
    //     }
    //   }
    // })
    entity.controls = controls
    return {
      [name]: folder(
        {
          name: folder(
            {
              name: {
                value: name,
                onChange: (value) => {
                  entity.name = value
                }
              }
            },
            {
              collapsed: true
            }
          ),
          ...controls
        },
        {
          color: "white",
          ...(store ? { store } : {})
        }
      )
    }
  }, [entity, run])

  useControls(
    entity.name,
    {
      save: button(
        (get) => {
          let props = savedProps(get, entity)
          let diffs = [
            {
              source: entity.source,
              // value: Object.fromEntries(
              //   Object.entries(props).filter(([key, value]) => entity.dirty[key])
              // )
              value: props
            }
          ]
          // fetch("/__editor/write", {
          //   method: "POST",
          //   headers: {
          //     "Content-Type": "application/json"
          //   },
          //   body: JSON.stringify(diffs)
          // })
          client.save(diffs[0])
        },
        {
          disabled: true
        }
      )
    },
    {
      order: 1000
    }
  )

  useFrame(function editorControlsSystem() {
    if (entity.ref && entity.ref instanceof THREE.Object3D) {
      let state = levaStore.useStore.getState()

      let position = entity.position
      let id = entity.name + ".transform.position"
      let el = state.data[id]

      let newState = { ...state.data }
      let edit = false
      if (!eq.array(position, el.value)) {
        newState[id] = {
          ...state.data[id],
          disabled: true,
          value: position
        }
        edit = true
      }

      let rotation = entity.rotation
      id = entity.name + ".transform.rotation"
      el = state.data[id]
      if (!eq.angles(rotation, el.value)) {
        newState[id] = {
          ...state.data[id],
          disabled: true,
          value: rotation
        }
        edit = true
      }

      let scale = entity.scale
      id = entity.name + ".transform.scale"
      el = state.data[id]
      if (!eq.array(scale, el.value)) {
        newState[id] = {
          ...state.data[id],
          disabled: true,
          value: scale
        }
        edit = true
      }

      if (edit) {
        levaStore.useStore.setState({
          ...state,
          data: newState
        })
      }
    }
  })

  return null
})
