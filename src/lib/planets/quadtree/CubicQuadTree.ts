import * as THREE from "three"
import { Vector3 } from "three"
import { QuadTree } from "./Quadtree"

export interface CubicQuadTreeParams {
  radius: number
  minNodeSize: number
  origin: Vector3
}

export class CubicQuadTree {
  private sides: {
    transform: THREE.Matrix4
    worldToLocal: THREE.Matrix4
    quadtree: QuadTree
  }[] = []

  constructor(private params: CubicQuadTreeParams) {
    const r = params.radius
    let m
    const transforms: THREE.Matrix4[] = []
    // +Y
    m = new THREE.Matrix4()
    m.makeRotationX(-Math.PI / 2)
    m.premultiply(new THREE.Matrix4().makeTranslation(0, r, 0))
    transforms.push(m)

    // // -Y
    // m = new THREE.Matrix4()
    // m.makeRotationX(Math.PI / 2)
    // m.premultiply(new THREE.Matrix4().makeTranslation(0, -r, 0))
    // transforms.push(m)

    // // +X
    // m = new THREE.Matrix4()
    // m.makeRotationY(Math.PI / 2)
    // m.premultiply(new THREE.Matrix4().makeTranslation(r, 0, 0))
    // transforms.push(m)

    // // -X
    // m = new THREE.Matrix4()
    // m.makeRotationY(-Math.PI / 2)
    // m.premultiply(new THREE.Matrix4().makeTranslation(-r, 0, 0))
    // transforms.push(m)

    // // +Z
    // m = new THREE.Matrix4()
    // m.premultiply(new THREE.Matrix4().makeTranslation(0, 0, r))
    // transforms.push(m)

    // // -Z
    // m = new THREE.Matrix4()
    // m.makeRotationY(Math.PI)
    // m.premultiply(new THREE.Matrix4().makeTranslation(0, 0, -r))
    // transforms.push(m)

    for (let t of transforms) {
      this.sides.push({
        transform: t.clone(),
        worldToLocal: t.clone().invert(),
        quadtree: new QuadTree({
          size: r,
          minNodeSize: this.params.minNodeSize,
          localToWorld: t,
          origin: params.origin
        })
      })
    }
  }

  getChildren() {
    const children = []

    for (let s of this.sides) {
      const side = {
        transform: s.transform,
        children: s.quadtree.getChildren()
      }
      children.push(side)
    }
    return children
  }

  // create all possible children up to a minimum value
  // measuring from this position
  insert(pos: THREE.Vector3) {
    for (let s of this.sides) {
      s.quadtree.insert(pos)
    }
  }
}
