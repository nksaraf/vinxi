import { useFrame } from "@react-three/fiber"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Suspense } from "react"
import * as RC from "render-composer"
import { Stage } from "./configuration"
import { controller } from "../input"
import { Physics } from "@react-three/rapier"
import { ErrorBoundary } from "react-error-boundary"
import { SidebarTunnel } from "./editor/tunnel"
import { Devtools } from "./Devtools"

export const World = ({ children }: React.PropsWithChildren<{}>) => {
  return (
    <group>
      <ErrorBoundary fallback={<group></group>}>
        <Physics
          updatePriority={Stage.Physics}
          colliders={false}
          timeStep="vary"
        >
          <Devtools />
          {children}
        </Physics>
      </ErrorBoundary>
    </group>
  )
}

const Controller = () => {
  useFrame(function updateController() {
    controller.update()
  }, Stage.Early)

  return null
}

const client = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false
    }
  }
})

export const GameCanvas = ({ children, ...props }: RC.CanvasProps) => {
  return (
    <>
      <RC.Canvas
        dpr={1}
        shadows={true}
        gl={{
          alpha: true
        }}
        {...props}
      >
        <Controller />
        <RC.RenderPipeline updatePriority={Stage.Render}>
          <QueryClientProvider client={client}>
            <Suspense>
              <World>{children}</World>
            </Suspense>
          </QueryClientProvider>
        </RC.RenderPipeline>
      </RC.Canvas>
      <SidebarTunnel.Out />
    </>
  )
}
