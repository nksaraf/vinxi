export type Listener<P> = (payload: P) => void

export class Event<P = void> {
  listeners = new Set<Listener<P>>()

  constructor() {
    this.emit = this.emit.bind(this)
  }

  clear() {
    this.listeners.clear()
  }

  addListener(listener: Listener<P>) {
    this.listeners.add(listener)
    return () => this.removeListener(listener)
  }

  removeListener(listener: Listener<P>) {
    this.listeners.delete(listener)
  }

  emit(payload: P) {
    for (const listener of this.listeners) {
      listener(payload)
    }
  }
}
