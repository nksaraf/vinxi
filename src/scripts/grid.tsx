import { Html, useCamera, useGLTF } from "@react-three/drei"
import { forwardRef, useState } from "react"
import { useMemo } from "react"
import {
  CanvasTexture,
  Euler,
  GridHelper,
  Material,
  MeshBasicMaterial,
  PlaneGeometry,
  Vector3
} from "three"
import { toast } from "react-hot-toast"
import { game } from "vinxi/game"
import { Helper } from "vinxi/lib/Helper"
import { MeshComponent } from "vinxi/lib/MeshComponent"
import { selectEntity } from "vinxi/editor/Editor"
import { folder } from "leva"
import React from "react"
import { useFrame } from "@react-three/fiber"
import { placeObjects } from "./placeObjects"
import { buildingSystem } from "./buildingSystem"
import { useStore } from "statery"
import { useKeyboard } from "vinxi/lib/useKeyboard"
import { GridItem } from "./GridItem"

declare global {
  export interface Components {
    grid?: {
      size: number
      cellSize: number
    }
  }
}

export let grids = game.world.with("grid")

const plane = new PlaneGeometry(1, 2, 1, 1)
const material = new MeshBasicMaterial()
class GridObject {
  constructor(
    public grid: GridXZ<GridObject>,
    public x: number,
    public z: number,
    public placedEntity?: Components
  ) {}
}

const Grid = forwardRef(({ width, height, entity, cellSize = 2 }, ref) => {
  const grid = useMemo(() => {
    let grid = new GridXZ<GridObject>(
      width,
      height,
      cellSize,
      new Vector3(),
      (grid, x, z) => new GridObject(grid, x, z)
    )

    entity.grid$ = grid
    return grid
  }, [width, height])

  // const [canvas, ctx] = useMemo(() => {
  //   const canvas = document.createElement("canvas")
  //   canvas.width = 1600
  //   canvas.height = 1600
  //   const ctx = canvas.getContext("2d")
  //   ctx.fillStyle = "#fff"
  //   // ctx.fillRect(0, 0, 128, 128)
  //   // ctx.fillStyle = "#fff"
  //   // ctx.fillRect(0, 0, 64, 64)
  //   // ctx.fillRect(64, 64, 64, 64)
  //   return [canvas, ctx]
  // }, [])

  // useFrame(({ clock }) => {
  //   ctx.font = "50 8px monospace"
  //   ctx.fillText("Hello world", 10, 50)

  //   for (var row of grid.grid) {
  //     for (var [x, y] of row) {
  //       ctx.fillStyle = "#fff"
  //       ctx.fillText("Hello world", x * cellSize * 40, y * cellSize * 40)
  //     }
  //   }
  //   // ctx.fillStyle = "#000"
  //   // ctx.fillRect(0, 0, 128, 128)
  //   // ctx.fillStyle = "#fff"
  //   // ctx.fillRect(0, 0, Math.floor(clock.getElapsedTime() % 64), 64)
  // })

  // const texture = useMemo(() => {
  //   return new CanvasTexture(canvas)
  // }, [canvas])
  const { objectType, state } = useStore(buildingSystem)
  console.log(objectType)
  return (
    <group ref={ref} onPointerDown={(e) => selectEntity(entity)}>
      {grid.grid.map((row, x) => (
        <React.Fragment key={x}>
          {row.map((_, y) => (
            <GridItem
              x={x}
              y={y}
              cellSize={cellSize}
              grid={grid}
              key={`${x},${y}`}
            />
          ))}
        </React.Fragment>
      ))}
      <mesh
        rotation-x={-Math.PI / 2}
        position={grid.getWorldPosition(width / 2, height / 2)}
        onClick={(e) => {
          let [x, y] = [
            Math.floor(e.point.x / grid.cellSize),
            Math.floor(e.point.z / grid.cellSize)
          ]
          let object = grid.grid[x][y]

          if (state === "building") {
            if (object.placedEntity) {
              toast.error("Couldn't build here!", {})
            }

            console.log(objectType)
            grid.grid[x][y].placedEntity = game.world.add(
              placeObjects[objectType].create({
                position: grid.getWorldPosition(x, y),
                scale: new Vector3(grid.cellSize, grid.cellSize, grid.cellSize)
              })
            )
          } else {
            if (object.placedEntity) {
              buildingSystem.set({
                selectedEntity: object.placedEntity
              })
            }
          }
        }}
      >
        <planeGeometry args={[width * cellSize, height * cellSize]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
})

/* 
    ------------------- Code Monkey -------------------

    Thank you for downloading this package
    I hope you find it useful in your projects
    If you have any questions let me know
    Cheers!

               unitycodemonkey.com
    --------------------------------------------------
 */

class GridXZ<TGridObject> {
  grid: TGridObject[][]
  constructor(
    public width: number,
    public height: number,
    public cellSize: number,
    public origin: Vector3,
    createGridObject: (
      grid: GridXZ<TGridObject>,
      x: number,
      z: number
    ) => TGridObject
  ) {
    let grid: TGridObject[][] = []
    for (let x = 0; x < width; x++) {
      grid.push([])
      for (let z = 0; z < height; z++) {
        grid[x].push(createGridObject(this, x, z))
      }
    }
    this.grid = grid
  }

  getWorldPosition(x: number, z: number, height: number = 0, vec?: Vector3) {
    if (!vec) vec = new Vector3()
    vec.set(
      x * this.cellSize + this.cellSize / 2 + this.origin.x,
      height,
      z * this.cellSize + this.cellSize / 2 + this.origin.z
    )
    return vec
  }
  // public event EventHandler<OnGridObjectChangedEventArgs> OnGridObjectChanged;
  // public class OnGridObjectChangedEventArgs : EventArgs {
  //     public int x;
  //     public int y;
  // }
  // private int width;
  // private int height;
  // private float cellSize;
  // private Vector3 originPosition;
  // private TGridObject[,] gridArray;
  // public Grid(int width, int height, float cellSize, Vector3 originPosition, Func<Grid<TGridObject>, int, int, TGridObject> createGridObject) {
  //     this.width = width;
  //     this.height = height;
  //     this.cellSize = cellSize;
  //     this.originPosition = originPosition;
  //     gridArray = new TGridObject[width, height];
  //     for (int x = 0; x < gridArray.GetLength(0); x++) {
  //         for (int y = 0; y < gridArray.GetLength(1); y++) {
  //             gridArray[x, y] = createGridObject(this, x, y);
  //         }
  //     }
  //     bool showDebug = false;
  //     if (showDebug) {
  //         TextMesh[,] debugTextArray = new TextMesh[width, height];
  //         for (int x = 0; x < gridArray.GetLength(0); x++) {
  //             for (int y = 0; y < gridArray.GetLength(1); y++) {
  //                 debugTextArray[x, y] = UtilsClass.CreateWorldText(gridArray[x, y]?.ToString(), null, GetWorldPosition(x, y) + new Vector3(cellSize, cellSize) * .5f, 8, Color.white, TextAnchor.MiddleCenter);
  //                 Debug.DrawLine(GetWorldPosition(x, y), GetWorldPosition(x, y + 1), Color.white, 100f);
  //                 Debug.DrawLine(GetWorldPosition(x, y), GetWorldPosition(x + 1, y), Color.white, 100f);
  //             }
  //         }
  //         Debug.DrawLine(GetWorldPosition(0, height), GetWorldPosition(width, height), Color.white, 100f);
  //         Debug.DrawLine(GetWorldPosition(width, 0), GetWorldPosition(width, height), Color.white, 100f);
  //         OnGridObjectChanged += (object sender, OnGridObjectChangedEventArgs eventArgs) => {
  //             debugTextArray[eventArgs.x, eventArgs.y].text = gridArray[eventArgs.x, eventArgs.y]?.ToString();
  //         };
  //     }
  // }
  // public int GetWidth() {
  //     return width;
  // }
  // public int GetHeight() {
  //     return height;
  // }
  // public float GetCellSize() {
  //     return cellSize;
  // }
  // public Vector3 GetWorldPosition(int x, int y) {
  //     return new Vector3(x, y) * cellSize + originPosition;
  // }
  // public void GetXY(Vector3 worldPosition, out int x, out int y) {
  //     x = Mathf.FloorToInt((worldPosition - originPosition).x / cellSize);
  //     y = Mathf.FloorToInt((worldPosition - originPosition).y / cellSize);
  // }
  // public void SetGridObject(int x, int y, TGridObject value) {
  //     if (x >= 0 && y >= 0 && x < width && y < height) {
  //         gridArray[x, y] = value;
  //         TriggerGridObjectChanged(x, y);
  //     }
  // }
  // public void TriggerGridObjectChanged(int x, int y) {
  //     OnGridObjectChanged?.Invoke(this, new OnGridObjectChangedEventArgs { x = x, y = y });
  // }
  // public void SetGridObject(Vector3 worldPosition, TGridObject value) {
  //     GetXY(worldPosition, out int x, out int y);
  //     SetGridObject(x, y, value);
  // }
  // public TGridObject GetGridObject(int x, int y) {
  //     if (x >= 0 && y >= 0 && x < width && y < height) {
  //         return gridArray[x, y];
  //     } else {
  //         return default(TGridObject);
  //     }
  // }
  // public TGridObject GetGridObject(Vector3 worldPosition) {
  //     int x, y;
  //     GetXY(worldPosition, out x, out y);
  //     return GetGridObject(x, y);
  // }
}

export function GridSystem() {
  useKeyboard({
    onKeyDown(e) {
      console.log(e.code)
      if (e.code === "KeyB") {
        buildingSystem.set({
          state: "building",
          selectedEntity: null
        })
      } else if (e.code === "Escape") {
        buildingSystem.set({
          state: "selecting",
          selectedEntity: null
        })
      }
    }
  })

  const { selectedEntity } = useStore(buildingSystem)

  return (
    <>
      <Html>{selectedEntity?.name}</Html>
      <game.Entities in={grids}>
        {(entity) => {
          return (
            <game.Entity entity={entity}>
              <game.Component name="gltfMesh$">
                <Grid entity={entity} {...entity.grid} />
              </game.Component>
            </game.Entity>
          )
        }}
      </game.Entities>
    </>
  )
}
