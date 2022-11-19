import WorkerThread from "./Worker"

export default class WorkerThreadPool<T> {
  #freeWorkers: WorkerThread<T>[] = []
  #busyWorkers: Record<string, WorkerThread<T>> = {}
  #queue: [any, (data: T) => void][] = []
  #workers: WorkerThread<T>[] = []
  constructor(size: number, worker: new () => Worker) {
    this.#workers = [...Array(size)].map(_ => new WorkerThread(new worker()))
    this.#freeWorkers = [...this.#workers]
  }

  get workers() {
    return this.#workers
  }

  get length() {
    return this.#workers.length
  }

  get queueLength() {
    return this.#queue.length
  }

  get busyLength() {
    return Object.keys(this.#busyWorkers).length
  }

  get busy() {
    return this.#queue.length > 0 || this.busyLength > 0
  }

  enqueue(workItem: any, resolve: (data: T) => void) {
    this.#queue.push([workItem, resolve])
    this.#pumpQueue()
  }

  #pumpQueue() {
    while (this.#freeWorkers.length > 0 && this.#queue.length > 0) {
      const worker = this.#freeWorkers.pop()!
      this.#busyWorkers[worker.id] = worker
      const [workItem, workResolve] = this.#queue.shift()!

      worker.postMessage(workItem, data => {
        delete this.#busyWorkers[worker.id]
        this.#freeWorkers.push(worker)
        workResolve(data)
        this.#pumpQueue()
      })
    }
  }
}
