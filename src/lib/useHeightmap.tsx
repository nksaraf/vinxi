import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import {
  Vector3Tuple,
  PlaneGeometry,
  Vector3,
  Color,
  Float32BufferAttribute
} from "three"
import { width, resolution } from "./terrain/grass"
import { useNoiseTexture } from "./useNoiseTexture"

export function useHeightmap() {
  const texture = useNoiseTexture()

  const query = useQuery({
    queryFn: async () => {
      let el = document.createElement("canvas")
      el.height = 512
      el.width = 512
      let ctx = el.getContext("2d")
      console.log(texture.source.data.width)
      ctx?.drawImage(texture.source.data, 0, 0, 512, 512, 0, 0, 512, 512)
      // document.body.appendChild(el)
      return ctx?.getImageData(0, 0, 512, 512)!
    },
    queryKey: ["heightmap"]
  })

  return query.data
}

function NoisePlane({
  position,
  imageData,
  scale,
  offset
}: {
  position: Vector3Tuple
  imageData: ImageData
  scale: number
  offset: [number, number]
}) {
  const plane = useMemo(() => {
    const geom = new PlaneGeometry(width, width, resolution, resolution)
    geom.lookAt(new Vector3(0, 1, 0))
    geom.computeVertexNormals()

    const color = new Color()
    const colors = []
    const count = geom.attributes.position.count

    for (let index = 0; index < count; index++) {
      const x = geom.attributes.position.array[index * 3]
      const y = geom.attributes.position.array[index * 3 + 2]

      // color.setHSL((t - 512) / 512, 1.0, 0.5)

      const color = texture2D(
        imageData,
        (x - offset[0] + position[0]) / (width * scale),
        (y - offset[1] + position[2]) / (width * scale)
      )
      colors.push(color[0] / 255.0, color[1] / 255.0, color[2] / 255.0)
    }
    geom.setAttribute("color", new Float32BufferAttribute(colors, 3))
    return geom
  }, [imageData, position])

  return (
    <mesh position={position} geometry={plane}>
      <meshBasicMaterial vertexColors />
    </mesh>
  )
}

function texture2D(data: ImageData, x: number, y: number) {
  // remove floating part since we are sampling one pixel
  x = Math.round(x * data.width)
  y = Math.round(y * data.width)

  // we have both positive and negative values
  let textureX = Math.abs(x) % data.width
  let textureY = Math.abs(y) % data.width

  // wrap properly like THREE.RepeatWrapping
  if (x < 0) x = data.width - 1 - textureX
  else x = textureX

  // wrap properly and handle the inversion of the y axis
  if (y < 0) y = textureY
  else y = data.width - 1 - textureY

  // pixel index in the flattened data array
  let pixel = data.width * y + x

  return [
    data.data[pixel * 4],
    data.data[pixel * 4 + 1],
    data.data[pixel * 4 + 2]
  ]
}

export function getYPosition(
  memo: ImageData,
  x: number,
  y: number,
  scale: number,
  offset = [0, 0]
): number {
  let width = 512
  let height =
    50.0 *
    (2.0 *
      (texture2D(
        memo,
        (x - offset[0]) / (width * scale),
        (y - offset[1]) / (width * scale)
      )[0] /
        255.0) -
      1.0)

  return height
}
