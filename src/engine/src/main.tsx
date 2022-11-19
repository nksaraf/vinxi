import { Environment } from "@react-three/drei"
import { useControls } from "leva"
import { ComponentProps, Suspense } from "react"
import GrassSystem from "../systems/grass"

export function Scene() {
  const { background, environment } = useControls(
    "world",
    {
      background: "#EEEEEE",
      environment: {
        value: "forest",
        options: [
          "forest",
          "apartment",
          "city",
          "dawn",
          "lobby",
          "park",
          "sunset",
          "warehouse",
          "studio",
          "night",
          "none"
        ] as ComponentProps<typeof Environment>["preset"][]
      }
    },
    {
      collapsed: true
    }
  )

  return (
    <>
      <color attach="background" args={[background]} />
      <Suspense>
        {environment !== "none" && (
          <Environment preset={environment as any} background={true} />
        )}
      </Suspense>
      {/* <KinematicCharacterController /> */}
      <ambientLight intensity={0} />

      <GrassSystem />
    </>
  )
}
