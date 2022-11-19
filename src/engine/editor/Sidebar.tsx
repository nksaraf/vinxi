import * as UI from "ui-composer"
import { GameState, SidebarTunnel } from "../state"

export const Sidebar = () => (
  <>
    <UI.Panel>
      <UI.Heading>Scenes</UI.Heading>
      <UI.VerticalGroup>
        <UI.Button onClick={() => GameState.enter("menu")}>
          Menu Scene
        </UI.Button>
        <UI.Button onClick={() => GameState.enter("gameplay")}>
          Gameplay Scene
        </UI.Button>
        <UI.Button onClick={() => GameState.enter("world")}>
          World Scene
        </UI.Button>
      </UI.VerticalGroup>
    </UI.Panel>

    <SidebarTunnel.Out />
  </>
)
