import Color from './Color'
import Vector from './Vector'

export interface TileConstructorOptions {
  char: string
  color: Color
  background: Color
  pos: Vector
  isCorner: boolean
  isVisible: boolean
  isSolid: boolean
}

export default class Tile {
  char: string
  color: Color
  background: Color
  pos: Vector
  isCorner: boolean
  isVisible: boolean
  isSolid: boolean

  readonly id: string = Math.random().toString(36).slice(2)

  constructor(options: Partial<TileConstructorOptions>) {
    this.char = options.char ?? ' '
    this.color = options.color ?? new Color()
    this.background = options.background ?? new Color(0, 0, 0, 1)
    this.pos = options.pos ?? new Vector(0, 0)
    this.isCorner = options.isCorner ?? false
    this.isVisible = options.isVisible ?? true
    this.isSolid = options.isSolid ?? false
  }

  equal(tile: Tile) {
    return this.char === tile.char &&
      this.color.equal(tile.color) &&
      this.background.equal(tile.background) &&
      this.pos.equal(tile.pos) &&
      this.isVisible === tile.isVisible &&
      this.isSolid === tile.isSolid
  }
}
