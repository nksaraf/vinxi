import { makeStore } from "statery"
import { AudioListener } from "three"

export enum Layers {
  Player,
  Bullet,
  Asteroid,
  Pickup
}

export const gameplayStore = makeStore({
  listener: null as AudioListener | null
})

import { parse } from "./world"

const rawData = await fetch("/scenes/home.json").then((res) => res.text())

let world: ReturnType<typeof parse>
if (globalThis.world) {
  world = globalThis.world
} else {
  world = parse(rawData)
}
console.log(world)

globalThis.game = world

export const game = world
