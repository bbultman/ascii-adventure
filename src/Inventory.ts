import Color from './Color'
import Layer from './Layer'
import Tile from './Tile'
import Vector from './Vector'

const log = (...x) => {
  if (true) console.log('INV ->', ...x)
}

const vectorExpand = (size: Vector) =>
  Array.from({ length: size.y * size.x }, (_, i) => new Vector(i % size.x, Math.floor(i / size.x)))

const buildSquare = (size: Vector) => vectorExpand(size).map((pos) => new Tile({ pos, char: ' ' }))

const posToIndex = ({ x, y }: Vector) => y * 80 + x
const mergeTiles = (base: Tile[], addition: Tile[], pos: Vector): void => {
  addition.forEach((newTile) => {
    base[posToIndex(newTile.pos.add(pos))] = newTile
  })
}

const generateBackgroundTiles = (size: Vector) => {
  const background = buildSquare(size)

  writeIntoTiles('Inventory', background, new Vector(35, 0))

  return background
}

const writeIntoTiles = (input: string, target: Tile[], pos: Vector) => {
  const tiles = input.split('').map(
    (char, x) =>
      new Tile({
        char,
        color: new Color(255, 255, 255, 1),
        background: new Color(0, 0, 0, 1),
        pos: new Vector(x, 0),
        isVisible: true,
      })
  )

  mergeTiles(target, tiles, pos)
}

export default class Inventory {
  layer: Layer
  size: Vector
  pos: Vector
  items: string[] // What should this be?
  tiles: Tile[]

  constructor(layer: Layer, size: Vector) {
    this.layer = layer
    this.size = size
    this.pos = Vector.Zero()
    this.items = ['A hat']
    this.tiles = generateBackgroundTiles(size)
  }

  addItem(item: string) {
    log('Add item', item)
    this.items.push(item)
  }

  removeItem(item: string) {
    log('Remove item', item)
    this.items.splice(this.items.indexOf(item), 1)
  }

  posToIndex = ({ x, y }: Vector) => y * this.size.x + x

  render() {
    this.tiles.forEach((tile) => {
      if (this.layer.opacity === 1) this.layer.draw(tile)
      if (this.layer.opacity === 0) this.layer.drop(tile)
    })
  }
}
