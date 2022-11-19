import { useFrame } from "@react-three/fiber"
import { useEffect } from "react"
import { Controller as ControllerImpl } from "./index"

export const useController = (
  controller: ControllerImpl,
  renderPriority?: number
) => {
  useEffect(() => {
    controller.start()
    return () => controller.stop()
  })

  useFrame(() => {
    controller.update()
  }, renderPriority)
}

export const Controller = ({
  controller,
  updatePriority
}: {
  controller: ControllerImpl
  updatePriority?: number
}) => {
  useController(controller, updatePriority)
  return null
}
