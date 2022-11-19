import { Html, Sphere } from "@react-three/drei"
import {
  CameraHelper,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  Vector3
} from "three"
import { Helper } from "../lib/Helper"
import { registerComponent, selectEntity, store } from "./editor"

import { useEntities } from "miniplex/react"
import {
  createRoot,
  PerspectiveCameraProps,
  ReconcilerRoot,
  useFrame,
  useThree
} from "@react-three/fiber"
import { useLayoutEffect, useRef } from "react"
import { useStore } from "statery"
import { folder } from "leva"
import { usePersistedControls } from "../lib/usePersistedControls"
import { game } from "../game"
import { Stage } from "../configuration"
import { bitmask } from "render-composer"
import { createPlugin, useInputContext } from "leva/plugin"
import { With } from "miniplex"

declare global {
  export interface Components {
    cameraTarget?: {
      positionOffset: [number, number, number]
      lookAtOffset: [number, number, number]
    }
    camera?: PerspectiveCameraProps
    camera$?: PerspectiveCamera
    controls?: any
  }
}

const cameras = game.world.with("camera")
const activeCameras = game.world.with("camera$", "transform", "active")
const cameraObjects = game.world.with("camera$", "transform")
const cameraTargets = game.world.with("cameraTarget", "transform")

export function CameraSystem() {
  const { editor } = useStore(store)
  useFrame(() => {
    for (var entity of cameraObjects) {
      if (!entity.controls || editor) {
        entity.camera$.position.copy(entity.transform.position)
        entity.transform.rotation &&
          entity.camera$.rotation.copy(entity.transform.rotation)
        entity.transform.scale &&
          entity.camera$.scale.copy(entity.transform.scale)
      }
    }
  })
  return (
    <>
      <game.Entities in={cameras}>
        {(entity) => (
          <>
            <game.Component name="camera$">
              <perspectiveCamera
                layers-mask={bitmask.not(1)}
                {...entity.transform}
                {...entity.camera}
              />
            </game.Component>
            {editor && (
              <game.Component name="helper$">
                <Sphere
                  layers-mask={bitmask(1)}
                  scale={0.25}
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    console.log(e)
                    selectEntity(entity)
                  }}
                >
                  <Html
                    style={{
                      userSelect: "none"
                    }}
                    pointerEvents="all"
                  >
                    <span
                      style={{
                        fontSize: "1rem"
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        selectEntity(entity)
                      }}
                    >
                      🎥
                    </span>
                  </Html>
                  <meshBasicMaterial color="black" />
                </Sphere>
              </game.Component>
            )}
            {editor && (
              <Helper entity={() => entity.camera$} helper={CameraHelper} />
            )}
          </>
        )}
      </game.Entities>
      <CameraLookAtSystem />
      <ActiveCameraSystem />
    </>
  )
}

const offset = new Vector3(-3, 10, -20)
const lookAt = new Vector3(0, 1, 5)
const idealLookAt = new Vector3()
const tmpTarget = new Vector3()
const tmpLookAt = new Vector3()

export const CameraLookAtSystem = () => {
  const [camera] = useEntities(activeCameras)
  const [target] = useEntities(cameraTargets)
  const set = useThree(({ set }) => set)
  const [controls] = usePersistedControls("systems", {
    followCamera: false
  })
  const { editor } = useStore(store)

  useFrame(function cameraLookAt(_, dt) {
    if (editor && !controls.followCamera) {
      return
    }

    if (camera) {
      if (!target) {
        // object.position.copy(camera.transform.position);
        // object.setRotationFromEuler(camera.transform.rotation);
        camera.camera$.lookAt(0, 0, 0)
        camera.transform.rotation.copy(camera.camera$.rotation)
      } else {
        lookAt.set(...target.cameraTarget.lookAtOffset)
        offset.set(...target.cameraTarget.positionOffset)
        // based on code from https://github.com/simondevyoutube/ThreeJS_Tutorial_ThirdPersonCamera/blob/main/main.js
        const idealTarget = tmpTarget
          .copy(offset)
          // .applyEuler(target.transform?.rotation)
          .add(target.transform.position)

        const t = (1 - Math.pow(0.001, dt)) / 3

        const cameraLookAt = tmpLookAt
          .copy(lookAt)
          // .applyEuler(target.transform?.rotation)
          .add(target.transform.position)

        idealLookAt.lerp(cameraLookAt, t)

        camera.camera$?.position.lerp(idealTarget, t)
        camera.transform.position.lerp(idealTarget, t)
        camera.camera$.lookAt(idealLookAt)
        camera.transform.rotation.setFromQuaternion(camera.camera$.quaternion)
      }
    }
  }, Stage.Late)
  return null
}

export const ActiveCameraSystem = () => {
  const [camera] = useEntities(activeCameras)
  const set = useThree(({ set }) => set)
  const activeCamera = useThree(({ camera }) => camera)
  const size = useThree(({ size }) => size)
  const { editor } = useStore(store)

  useLayoutEffect(() => {
    console.log("setting active camera", camera)
    if (camera && !editor) {
      const oldCam = activeCamera
      console.log(camera)
      set(() => ({ camera: camera?.camera$ as PerspectiveCamera }))

      return () => set(() => ({ camera: oldCam }))
    }
    // The camera should not be part of the dependency list because this components camera is a stable reference
    // that must exchange the default, and clean up after itself on unmount.
  }, [set, camera?.camera$, editor])

  useLayoutEffect(() => {
    if (camera?.camera$) {
      ;(camera.camera$ as PerspectiveCamera).aspect = size.width / size.height
    }
  }, [size, camera?.camera$])

  useLayoutEffect(() => {
    if (camera?.camera$) {
      ;(camera.camera$ as PerspectiveCamera).updateProjectionMatrix()
    }
  }, [camera?.camera$])
  return null
}

var preview = createPlugin({
  normalize(input) {
    return {
      settings: {
        scene: input.scene,
        entity: input.entity
      },
      value: ""
    }
  },
  format: (v) => v,
  component: () => {
    const context = useInputContext()
    const canvasRef = useRef<HTMLDivElement>(null)
    useCameraPreview(context.settings.scene, context.settings.entity, canvasRef)

    return (
      <div
        style={{
          width: "100px",
          height: "100px"
        }}
      >
        <canvas ref={canvasRef} />
      </div>
    )
  }
})

registerComponent("camera", {
  addTo(e) {
    game.world.addComponent(e, "camera", {})
  },
  controls(entity, reset, scene) {
    return {
      camera: folder(
        {
          // positionOffset: {
          //   step: 0.5,
          //   value: entity.cameraTarget.positionOffset,
          //   onChange: (value) => {
          //     entity.cameraTarget.positionOffset = value
          //   },
          //   transient: true
          // },
          // lookAtOffset: {
          //   step: 0.5,
          //   value: entity.cameraTarget.lookAtOffset,
          //   onChange: (value) => {
          //     entity.cameraTarget.lookAtOffset = value
          //   },
          //   transient: true
          // }
          preview: preview({
            scene,
            entity
          })
        },
        {
          collapsed: true
        }
      )
    }
  }
})

function CameraPreview(props: {
  scene: Scene
  camera: PerspectiveCamera | OrthographicCamera
}) {
  const set = useThree((state) => state.set)
  set({
    scene: props.scene,
    camera: props.camera
  })
  return <></>
}

function useCameraPreview(
  scene: Scene,
  entity: With<Components, "camera$">,
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>
) {
  const rootRef = useRef<ReconcilerRoot<HTMLCanvasElement>>()
  useLayoutEffect(() => {
    if (canvasRef.current && entity.camera$ && scene && !rootRef.current) {
      rootRef.current = createRoot(canvasRef.current)
      rootRef.current.render(
        <CameraPreview scene={scene} camera={entity.camera$} />
      )
    }
    return () => {
      if (canvasRef.current) {
        // rootRef.current.unmount()
      }
    }
  }, [scene, entity, canvasRef])
}

registerComponent("cameraTarget", {
  addTo(e) {
    game.world.addComponent(e, "cameraTarget", {
      positionOffset: [5, 5, 5],
      lookAtOffset: [0, 0, 0]
    })
  },
  controls(entity) {
    return {
      cameraTarget: folder(
        {
          positionOffset: {
            step: 0.5,
            value: entity.cameraTarget.positionOffset,
            onChange: (value) => {
              entity.cameraTarget.positionOffset = value
            },
            transient: true
          },
          lookAtOffset: {
            step: 0.5,
            value: entity.cameraTarget.lookAtOffset,
            onChange: (value) => {
              entity.cameraTarget.lookAtOffset = value
            },
            transient: true
          }
        },
        {
          collapsed: true
        }
      )
    }
  }
})
