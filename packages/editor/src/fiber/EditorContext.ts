import React, { ComponentProps, createContext } from "react"
import { createEditorStore } from "./index"

export const EditorContext = createContext<ReturnType<
  typeof createEditorStore
> | null>(null)
export const SceneElementContext = createContext<string | null>(null)
