import { generateUUID } from "three/src/math/MathUtils"

export default class WorkerThread<T> {
  #worker: Worker
  #id: string = generateUUID()
  #resolve: ((data: T) => void) | null = null
  constructor(worker: Worker) {
    this.#worker = worker
    this.#worker.onmessage = (e: MessageEvent<T>) => {
      this.#onMessage(e)
    }
  }

  get id() {
    return this.#id
  }

  #onMessage(e: MessageEvent<T>) {
    const resolve = this.#resolve
    this.#resolve = null
    resolve && resolve(e.data)
  }

  postMessage(s: any, resolve: (data: T) => void) {
    this.#resolve = resolve
    this.#worker.postMessage(s)
  }

  dispose() {
    this.#worker.terminate()
  }
}
