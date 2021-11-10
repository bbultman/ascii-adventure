import Color from './Color'
import Tile from './Tile'
import Vector from './Vector'

const log = (...x) => {
  if (false) console.log('Layer ->', ...x)
}

interface DrawingOperation {
  tile: Tile
  char: string
  color: Color
  background: Color
  pos: Vector
  isVisible: boolean
  delete?: boolean
}

const drawingOperation = (tile: Tile, deleteTile = false): DrawingOperation => ({
  tile,
  char: tile.char,
  color: tile.color.clone(),
  background: tile.background.clone(),
  pos: tile.pos.clone(),
  isVisible: tile.isVisible,
  delete: deleteTile ?? false,
})

export class Camera {
  top = 0
  bottom = 0
  left = 0
  right = 0

  constructor(topLeft: Vector, bottomRight: Vector) {
    this.setFrame(topLeft.y, bottomRight.y, topLeft.x, bottomRight.x)
  }

  isInView({ x, y }: Vector) {
    return x > this.left - 1 && x < this.right + 1 && y > this.top - 1 && y < this.bottom + 1
  }

  moveCamera({ x, y }: Vector) {
    const top = y + this.top
    const bottom = y + this.bottom
    const left = x + this.left
    const right = x + this.right

    this.setFrame(top, bottom, left, right)
  }

  setFrame(top: number, bottom: number, left: number, right: number) {
    this.top = top
    this.bottom = bottom
    this.left = left
    this.right = right
  }
}

interface LayerConstructorOptions {
  camera?: Camera
  name: string
  opacity?: number
  isVisible?: boolean
  pos?: Vector
  size: Vector
}

export default class Layer {
  camera: Camera
  readonly name: string
  opacity: number
  isVisible: boolean
  pos: Vector
  size: Vector
  operations: Array<DrawingOperation> = []

  constructor(options: LayerConstructorOptions) {
    this.camera = options.camera ?? new Camera(Vector.Zero(), options.size) // Layer-sized default camera
    this.name = options.name
    this.opacity = options.opacity ?? 1
    this.isVisible = options.isVisible ?? true
    this.pos = options.pos ?? Vector.Zero()
    this.size = options.size

    log('Created layer', this.name, 'with camera', [
      this.camera.left,
      this.camera.top,
      this.camera.right,
      this.camera.bottom,
    ])
  }

  draw(tile: Tile) {
    if (!this.camera.isInView(tile.pos)) return

    this.operations.push(drawingOperation(tile))
  }

  drop(tile: Tile) {
    this.operations.push(drawingOperation(tile, true))
  }

  clear() {
    this.operations = []
  }
}
