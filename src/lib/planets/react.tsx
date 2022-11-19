import { Planet as HelloPlanet, PlanetProps as HelloPlanetProps } from "./"
import { useFrame } from "@react-three/fiber"
import * as React from "react"
import { Vector3 } from "three"
import { PartialBy } from "../utils/types"

export const PlanetContext = React.createContext<HelloPlanet<any>>(
  {} as HelloPlanet<any>
)

export const usePlanet = () => {
  return React.useContext(PlanetContext)
}

export type PlanetProps<D> = React.PropsWithChildren<
  Omit<HelloPlanetProps<D>, "material" | "workerProps"> &
    PartialBy<HelloPlanetProps<D>["workerProps"], "numWorkers"> & {
      lodOrigin: Vector3
    }
>

function PlanetInner<D>(
  props: PlanetProps<D>,
  forwardedRef: React.ForwardedRef<HelloPlanet<D>>
) {
  const {
    children,
    radius,
    inverted,
    minCellSize,
    minCellResolution,
    data,
    numWorkers = navigator.hardwareConcurrency || 8,
    lodOrigin,
    position,
    worker
  } = props

  const workerProps = React.useMemo(
    () => ({
      numWorkers,
      worker
    }),
    [worker, numWorkers]
  )

  const helloPlanet = React.useMemo(() => {
    return new HelloPlanet<D>({
      radius,
      inverted,
      minCellSize,
      minCellResolution,
      data,
      workerProps,
      position
    })
  }, [data, workerProps, radius])

  React.useEffect(() => {
    return () => {
      helloPlanet.dispose()
    }
  }, [])

  React.useEffect(() => {
    if (helloPlanet) {
      helloPlanet.inverted = !!inverted
      helloPlanet.minCellSize = minCellSize
      helloPlanet.minCellResolution = minCellResolution
      helloPlanet.position.copy(position)
      helloPlanet.rebuild()
    }
  }, [inverted, minCellSize, minCellResolution, position])

  useFrame(() => {
    helloPlanet.update(lodOrigin)
  })

  return (
    <primitive ref={forwardedRef} object={helloPlanet}>
      {children}
    </primitive>
  )
}

export const Planet = React.forwardRef(PlanetInner) as <D>(
  props: PlanetProps<D> & {
    ref?: React.ForwardedRef<HelloPlanet<D>>
  }
) => ReturnType<typeof PlanetInner<D>>
