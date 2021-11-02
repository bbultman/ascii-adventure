import { makeGroundTile, makeSolidTile } from './Objects'
import Tile from './Tile'
import Vector from './Vector'

const WIDTH = 80
const HEIGHT = 24

const vectorExpand = (size: Vector) =>
  Array.from({ length: size.y * size.x }, (_, i) => new Vector(i % size.x, Math.floor(i / size.x)))

const buildSquare = (size: Vector) => {
  const numberPossibleDoorPositions = (size.x - 2) * 2 + (size.y - 2) * 2

  let totalDoors = (numberPossibleDoorPositions / 10) * Math.random() + 1

  const roomTiles = vectorExpand(size).map((pos, i) => {
    const isCorner =
      (pos.x === 0 && (pos.y === 0 || pos.y === size.y - 1)) ||
      (pos.x === size.x - 1 && (pos.y === 0 || pos.y === size.y - 1))

    const isEdge = !isCorner && (pos.x === 0 || pos.y === 0 || pos.y === size.y - 1 || pos.x === size.x - 1)
    //const doorSeed = Math.sin(i * totalDoors * Math.random())
    //const isDoor = isEdge ? doorSeed > 0.9 : false

    //if (isEdge) {
    //  console.log(i, pos, doorSeed, isDoor)
    //}

    return isCorner
      ? makeSolidTile({ pos, char: '^' })
      : isEdge
      ? makeSolidTile({ pos })
      : makeGroundTile({ pos, char: '.' })
  })

  return roomTiles
}

const getTile = (tiles: Tile[], pos: Vector) => {
  return tiles[vectorToTileIndex(pos)]
}

const mergeTiles = (base: Tile[], addition: Tile[], pos: Vector): void => {
  addition.forEach((newTile) => {
    base[vectorToTileIndex(newTile.pos.add(pos))] = newTile
  })
}

const vectorToTileIndex = ({ x, y }: Vector) => y * WIDTH + x

const generateTiles = () =>
  vectorExpand(new Vector(WIDTH, HEIGHT)).map((pos: Vector, index: number) => {
    const rand = Math.random()
    const shouldBeSolid = index % 10 === 0 && rand < 0.1

    const isEdge = pos.x === 0 || pos.x === WIDTH - 1 || pos.y === 0 || pos.y === HEIGHT - 1

    if (isEdge) return makeSolidTile({ pos })
    if (shouldBeSolid) return makeSolidTile({ pos })

    return makeGroundTile({ pos, char: '.' })
  })

export default class World {
  readonly tiles: Tile[]
  readonly room: Tile[]
  constructor() {
    this.tiles = generateTiles()
    this.room = buildSquare(new Vector(5, 4))
    mergeTiles(this.tiles, this.room, new Vector(WIDTH / 2, HEIGHT / 2))
  }

  getTile(pos: Vector) {
    return this.tiles[vectorToTileIndex(pos)]
  }
}
