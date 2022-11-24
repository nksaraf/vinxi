import { makeStore } from "statery"
import { placeObjects } from "./placeObjects"

export const buildingSystem = makeStore({
  objectType: "conveyerBelt" as keyof typeof placeObjects,
  selectedEntity: null as Components | null,
  state: "building" as "building" | "selecting" | "crafting"
})

import { createState, createSelectorHook } from "@state-designer/react"

export const buildingMachine = createState({
  data: {
    objectType: "conveyerBelt" as keyof typeof placeObjects,
    selectedEntity: null as Components | null
  },
  states: {
    building: {
      on: {
        KEYDOWN: {
          if: "isEscape",
          to: "selecting"
        }
      }
    },
    selecting: {},
    crafting: {}
  },
  conditions: {
    isEscape: (data, event) => event.key === "Escape"
  }
})

export const useSelector = createSelectorHook(buildingMachine)
