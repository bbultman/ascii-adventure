import Layer from './Layer'
import Tile from './Tile'
import Vector from './Vector'

const log = (...x) => {
  if (true) console.log('INV ->', ...x)
}

const vectorExpand = (size: Vector) =>
  Array.from({ length: size.y * size.x }, (_, i) => new Vector(i % size.x, Math.floor(i / size.x)))

const buildSquare = (size: Vector) => vectorExpand(size).map((pos) => new Tile({ pos, char: ' ' }))

const mergeTiles = (base: Tile[], addition: Tile[], pos: Vector): void => {
  addition.forEach((newTile) => {
    base[vectorToTileIndex(newTile.pos.add(pos))] = newTile
  })
}

const generateBackgroundTiles = (size: Vector) => {
  const background = buildSquare(size)

  return background
}

const writeIntoTiles = (input: string, target: Tile[], pos: Vector) => {
  const tiles = input.split('').map((char, x) => new Tile({ char, pos: new Vector(x, 0) }))

  mergeTiles(target, tiles, pos)
}

const generateInfoTiles = (size: Vector, player: Player) => {
  const infoTiles = vectorExpand(size).map((pos) => new Tile({ pos }))

  const borderTiles = vectorExpand(new Vector(WIDTH, 1)).map(
    (pos) => new Tile({ char: '-', pos, color: new Color(255, 255, 255, 0.5) })
  )

  mergeTiles(infoTiles, borderTiles, Vector.Zero())

  const xOffset = 1
  const statRow = 3
  const statWidth = 7
  const statLabels = [
    `Str ${player.stats.strength}`,
    `Dex ${player.stats.dexterity}`,
    `Per ${player.stats.perception}`,
    `Int ${player.stats.intelligence}`,
    `Wis ${player.stats.wisdom}`,
  ]

  statLabels.forEach((stat, index) => {
    writeIntoTiles(stat, infoTiles, new Vector(index * statWidth + xOffset, statRow))
  })

  const xpLabel = `Xp ${player.experience}`

  writeIntoTiles(xpLabel, infoTiles, new Vector(WIDTH - Math.max(statWidth, xpLabel.length + 1), statRow))

  const hpLabel = `Hp ${player.hp}/${player.maxHp}`

  writeIntoTiles(hpLabel, infoTiles, new Vector(statLabels.length + statLabels.length * (xOffset + statWidth), statRow))

  return infoTiles
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
