import { createStateMachine } from "state-composer"
import tunnel from "tunnel-rat"

export type GameState = "nothing" | "menu" | "gameplay" | "world"

export const GameState = createStateMachine<GameState>("world")

export const startGame = () => GameState.enter("world")

export const SidebarTunnel = tunnel()
