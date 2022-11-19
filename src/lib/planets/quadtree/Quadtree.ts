import * as THREE from "three"
import { Vector3 } from "three"

const CHILD_SIZE_X_COMPARATOR = 1.25

export interface QuadTreeParams {
  localToWorld: THREE.Matrix4
  size: number
  minNodeSize: number
  origin: THREE.Vector3
}

export interface Node {
  bounds: THREE.Box3
  children: Node[]
  center: THREE.Vector3
  sphereCenter: THREE.Vector3
  size: THREE.Vector3
  root?: boolean
}

export class QuadTree {
  private root: Node
  private origin: Vector3
  constructor(private params: QuadTreeParams) {
    const s = params.size
    const b = new THREE.Box3(
      new THREE.Vector3(-s, -s, 0),
      new THREE.Vector3(s, s, 0)
    )
    this.origin = params.origin
    this.root = {
      bounds: b,
      children: [],
      center: b.getCenter(new THREE.Vector3()),
      sphereCenter: b.getCenter(new THREE.Vector3()),
      size: b.getSize(new THREE.Vector3()),
      root: true
    }
    this.root.sphereCenter = this.root.center.clone()
    this.root.sphereCenter.applyMatrix4(this.params.localToWorld)
    this.root.sphereCenter.normalize()
    this.root.sphereCenter.multiplyScalar(this.params.size)
    this.root.sphereCenter.add(params.origin)
  }

  getChildren() {
    const children: Node[] = []
    this.#getChildren(this.root, children)
    return children
  }

  #getChildren(node: Node, targetNodes: Node[]) {
    if (node.children.length === 0) {
      targetNodes.push(node)
      return
    }

    for (let c of node.children) {
      this.#getChildren(c, targetNodes)
    }
  }

  insert(pos: THREE.Vector3) {
    this.#insert(this.root, pos)
  }

  #insert(child: Node, pos: THREE.Vector3) {
    const distToChild = this.#distanceToChild(child, pos)

    if (
      distToChild < child.size.x * CHILD_SIZE_X_COMPARATOR &&
      child.size.x > this.params.minNodeSize
    ) {
      child.children = this.#createChildren(child)

      for (let c of child.children) {
        this.#insert(c, pos)
      }
    }
  }

  #distanceToChild(child: Node, pos: THREE.Vector3): number {
    return child.sphereCenter.distanceTo(pos)
  }

  #createChildren(child: Node): Node[] {
    const midpoint = child.bounds.getCenter(new THREE.Vector3())

    // Bottom left
    const b1 = new THREE.Box3(child.bounds.min, midpoint)

    // Bottom right
    const b2 = new THREE.Box3(
      new THREE.Vector3(midpoint.x, child.bounds.min.y, 0),
      new THREE.Vector3(child.bounds.max.x, midpoint.y, 0)
    )

    // Top left
    const b3 = new THREE.Box3(
      new THREE.Vector3(child.bounds.min.x, midpoint.y, 0),
      new THREE.Vector3(midpoint.x, child.bounds.max.y, 0)
    )

    // Top right
    const b4 = new THREE.Box3(midpoint, child.bounds.max)

    const children = [b1, b2, b3, b4].map((b) => {
      const center = b.getCenter(new THREE.Vector3())
      const sphereCenter = center.clone()
      sphereCenter.applyMatrix4(this.params.localToWorld)
      sphereCenter.normalize()
      sphereCenter.multiplyScalar(this.params.size)
      sphereCenter.add(this.origin)
      return {
        bounds: b,
        children: [],
        size: b.getSize(new THREE.Vector3()),
        sphereCenter,
        center
      }
    })

    return children
  }
}
