import { $, Input, InstanceID } from "shader-composer"
import { Random } from "shader-composer-toybox"

export const InstanceRNG =
  ({ seed }: { seed?: Input<"float"> } = {}) =>
  (offset: Input<"float"> = Math.random() * 10) =>
    Random($`${offset} + float(${InstanceID}) * 1.1005`)
