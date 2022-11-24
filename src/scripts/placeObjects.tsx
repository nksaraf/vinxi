import { Euler, Vector3 } from "three"

export const placeObjects = {
  grabber: {
    create: (transform = {}) => ({
      transform: {
        position: new Vector3(0, 0, 0),
        rotation: new Euler(0, 0, 0),
        scale: new Vector3(1, 1, 1),
        visible: true,
        ...transform
      },
      gltf: {
        import: "/assets/models/conveyer_belt.gltf?gltfjsx"
      },
      name: "grabber"
    })
  },
  conveyerBelt: {
    create: (transform = {}) => ({
      transform: {
        position: new Vector3(0, 0, 0),
        rotation: new Euler(0, 0, 0),
        scale: new Vector3(1, 1, 1),
        visible: true,
        ...transform
      },
      gltf: {
        import: "/assets/models/grabber.gltf?gltfjsx"
      },
      name: "conveyerBelt"
    })
  }
}
