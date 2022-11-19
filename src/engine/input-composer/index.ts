import { Event } from "./lib/event"

export * from "./lib/event"

export abstract class Control {}

export interface IVector {
  x: number
  y: number
}

export interface IValue {
  value: number
}

export class VectorControl extends Control implements IVector {
  constructor(public x = 0, public y = 0) {
    super()
  }

  length = () => Math.sqrt(this.x * this.x + this.y * this.y)

  apply = (v: IVector) => {
    this.x = v.x
    this.y = v.y
    return this
  }

  invertVertical() {
    this.y *= -1
    return this
  }

  invertHorizontal() {
    this.x *= -1
    return this
  }

  normalize = () => {
    const length = this.length()
    if (length > 0) {
      this.x /= length
      this.y /= length
    }
    return this
  }

  deadzone = (threshold = 0.2) => {
    const length = this.length()

    if (length < threshold) {
      this.x = 0
      this.y = 0
    } else {
      this.normalize()
      this.x = (this.x * (length - threshold)) / (1 - threshold)
      this.y = (this.y * (length - threshold)) / (1 - threshold)
    }

    return this
  }
}

export class ValueControl extends Control implements IValue {
  constructor(public value = 0) {
    super()
  }

  apply(v: number | ValueControl) {
    this.value = v instanceof ValueControl ? v.value : v
    return this
  }

  clamp(min = 0, max = 1) {
    this.value = Math.min(Math.max(this.value, min), max)
    return this
  }
}

export abstract class Device {
  abstract start(): void
  abstract stop(): void
  abstract update(): void

  onActivity = new Event()
}

export class KeyboardDevice extends Device {
  keys = new Set<string>()

  start() {
    window.addEventListener("keydown", this.onKeyDown)
    window.addEventListener("keyup", this.onKeyUp)
  }

  stop() {
    window.removeEventListener("keydown", this.onKeyDown)
    window.removeEventListener("keyup", this.onKeyUp)
  }

  update() {}

  getKey(code: string) {
    return new ValueControl(this.keys.has(code) ? 1 : 0)
  }

  getAxis(minKey: string, maxKey: string) {
    return new ValueControl(
      this.getKey(maxKey).value - this.getKey(minKey).value
    )
  }

  getVector(
    xMinKey: string,
    xMaxKey: string,
    yMinKey: string,
    yMaxKey: string
  ) {
    return new VectorControl(
      this.getAxis(xMinKey, xMaxKey).value,
      this.getAxis(yMinKey, yMaxKey).value
    )
  }

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.code)
    this.onActivity.emit()
  }

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code)
  }
}

export class GamepadDevice extends Device {
  constructor(public index: number) {
    super()
  }

  lastTimestamp: number = 0
  gamepad: Gamepad | null = null

  start() {}
  stop() {}

  update() {
    this.gamepad = navigator.getGamepads()[this.index]

    if (this.gamepad && this.gamepad.timestamp !== this.lastTimestamp) {
      this.lastTimestamp = this.gamepad.timestamp
      this.onActivity.emit()
    }
  }

  getButton = (index: number) =>
    new ValueControl(this.gamepad?.buttons[index].value ?? 0)

  getAxis = (index: number) => new ValueControl(this.gamepad?.axes[index] ?? 0)

  getVector = (xAxis: number, yAxis: number) =>
    new VectorControl(this.getAxis(xAxis).value, this.getAxis(yAxis).value)

  get rightTrigger() {
    return this.getButton(mappings.rightTrigger[this.gamepad?.id as any] ?? 7)
  }
}

const mappings: any = {
  rightTrigger: {
    "45e-b13-Xbox Wireless Controller": 16
  }
}

export abstract class Controller {
  abstract devices: Record<string, Device>
  abstract controls: Record<string, Control>

  start() {
    Object.values(this.devices).forEach((device) => device.start())
  }

  stop() {
    Object.values(this.devices).forEach((device) => device.stop())
  }

  update() {
    Object.values(this.devices).forEach((device) => device.update())
  }
}
