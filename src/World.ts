import Color from './Color'
import { GameViews } from './index'
import Mob from './Mob'
import { makeGroundTile, makeSolidTile } from './Objects'
import Player from './Player'
import Tile from './Tile'
import Vector from './Vector'

const WIDTH = 80
const HEIGHT = 24

const vectorExpand = (size: Vector) =>
  Array.from({ length: size.y * size.x }, (_, i) => new Vector(i % size.x, Math.floor(i / size.x)))

const buildSquare = (size: Vector) => {
  const roomTiles = vectorExpand(size).map((pos) => {
    const isCorner =
      (pos.x === 0 && (pos.y === 0 || pos.y === size.y - 1)) ||
      (pos.x === size.x - 1 && (pos.y === 0 || pos.y === size.y - 1))

    const isEdge = !isCorner && (pos.x === 0 || pos.y === 0 || pos.y === size.y - 1 || pos.x === size.x - 1)

    return isEdge || isCorner ? makeSolidTile({ pos, isCorner }) : makeGroundTile({ pos, char: '.' })
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

const generateBackgroundTiles = (size: Vector) => {
  const background = buildSquare(size)

  const room = buildSquare(new Vector(10, 10))

  mergeTiles(background, room, new Vector(15, 10))

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

const findNextStep = (grid: Tile[], start: Vector, goal: Vector) => {
  const xDelta = goal.x - start.x
  const yDelta = goal.y - start.y
  const couldMoveX = xDelta !== 0
  const couldMoveY = yDelta !== 0

  // Do we have further to go horizontally or vertically?
  const horizontalBias = Math.abs(xDelta) > Math.abs(yDelta)

  // Left or right?
  const xMove = xDelta > 0 ? new Vector(1, 0) : new Vector(-1, 0)
  // Up or down?
  const yMove = yDelta > 0 ? new Vector(0, 1) : new Vector(0, -1)

  const xPos = xMove.add(start)
  const yPos = yMove.add(start)

  const yTileIsSolid = getTile(grid, yPos).isSolid
  const xTileIsSolid = getTile(grid, xPos).isSolid

  if (horizontalBias && !xTileIsSolid) return xPos
  if (!horizontalBias && !yTileIsSolid) return yPos

  if (horizontalBias && xTileIsSolid && couldMoveY && !yTileIsSolid) return yPos
  if (!horizontalBias && yTileIsSolid && couldMoveX && !xTileIsSolid) return xPos

  return start
}

const vDist = (v1: Vector, v2: Vector) => Math.round(Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2)))

export default class World {
  private gameViews: GameViews
  playerMove: Vector = Vector.Zero()
  info: Tile[]
  readonly background: Tile[]
  readonly player: Player
  readonly mobs: Mob[]
  clearFromBuffer: (layer: string, tile: Tile) => void

  constructor(gameViews: GameViews, clearFn: (layer: string, tile: Tile) => void) {
    this.player = new Player({
      background: new Color(0, 0, 0, 0),
      char: '@',
      color: new Color(255, 0, 0, 1),
      pos: new Vector(5, 5),
      maxHp: 10,
    })

    this.gameViews = gameViews
    this.background = generateBackgroundTiles(gameViews.main.size)
    this.info = generateInfoTiles(gameViews.info.size, this.player)
    this.clearFromBuffer = clearFn
    this.mobs = Array.from({
      length: gameViews.main.size.x * gameViews.main.size.y,
    })

    const mob = new Mob({
      name: 'Znarf',
      pos: new Vector(12, 12),
      hp: 2,
      char: 'Z',
      color: new Color(255),
      background: new Color(0, 0, 0, 1),
    })

    this.mobs[vectorToTileIndex(mob.position)] = mob
  }

  setPlayerMove(vec: Vector) {
    this.playerMove = vec
  }

  gameMessage(message: string) {
    const padding = 2
    const xOffset = 1
    ;[message.substring(0, WIDTH - padding), message.substring(WIDTH - padding, (WIDTH - 1) * 2)].forEach(
      (line, yIndex) => {
        line.split('').forEach((char, xIndex) => {
          this.info[WIDTH * (yIndex + 1) + xIndex + xOffset].char = char
        })
      }
    )
  }

  getSurroundingTiles(pos: Vector) {
    return [
      pos.clone().add(new Vector(1, 0)),
      pos.clone().add(new Vector(-1, 0)),
      pos.clone().add(new Vector(0, 1)),
      pos.clone().add(new Vector(0, -1)),
    ].filter((pos) => !getTile(this.background, pos).isSolid)
  }

  clearGameMessage() {
    Array.from({ length: WIDTH }, (_, i) => {
      this.info[WIDTH + i].char = ' '
      this.info[WIDTH * 2 + i].char = ' '
    })
  }

  getMob(pos: Vector) {
    return this.mobs[vectorToTileIndex(pos)]
  }

  deleteMob(pos: Vector) {
    this.clearFromBuffer('actor', this.getMob(pos).tile)
    this.mobs.splice(vectorToTileIndex(pos), 1, undefined)
  }

  handleMobMovement() {
    const playerPos = this.player.position.clone()
    this.mobs
      .filter((a) => !!a)
      .forEach((M) => {
        const mobExistingPos = M.position.clone()
        const mobPlayerDistance = vDist(playerPos, mobExistingPos)

        if (mobPlayerDistance > 5) {
          this.mobs.splice(vectorToTileIndex(mobExistingPos), 1, undefined)
          const newPosition = M.move(this.getSurroundingTiles(mobExistingPos))

          this.mobs[vectorToTileIndex(newPosition)] = M
          return
        }

        const newMobPos = findNextStep(this.background, mobExistingPos, playerPos)

        if (getTile(this.background, newMobPos).isSolid) {
          console.log('Mob found wall, cant move to', newMobPos)
          return
        }

        if (newMobPos.equal(playerPos)) {
          // Attack player
          console.log('player loses hp!')
          this.player.hp--
          this.info = generateInfoTiles(this.gameViews.info.size, this.player)
          return mobExistingPos
        } else {
          M.moveTo(newMobPos)
          this.mobs.splice(vectorToTileIndex(mobExistingPos), 1, undefined)
          this.mobs[vectorToTileIndex(newMobPos)] = M
          return
        }

        console.log(`Mob: ${M.fullName} didnt know where to go! We need Pathfinding!`)
      })
  }

  movePlayer() {
    const newPlayerPos = this.playerMove.clone().add(this.player.position)
    const positionIndex = vectorToTileIndex(newPlayerPos)

    const M = this.mobs[positionIndex]

    if (M) {
      this.player.hp--
      const mobChar = M.fullName
      // TODO How much dmg, of what type?
      M.hp--

      if (M.dead) {
        this.player.experience++
        this.info = generateInfoTiles(this.gameViews.info.size, this.player)
        this.gameMessage(`Killed ${mobChar}! Gained 1 xp`)
        this.deleteMob(newPlayerPos)
      } else {
        this.info = generateInfoTiles(this.gameViews.info.size, this.player)
        // Attack!
        this.gameMessage(`Attacking ${M.tile.char} ${newPlayerPos.x}:${newPlayerPos.y}`)
      }

      return
    }

    const backgroundTile = getTile(this.background, newPlayerPos)

    if (backgroundTile.isSolid) {
      this.playerMove = Vector.Zero()
      this.gameMessage('You hit the wall...Ouch!')
      return
    }

    this.clearGameMessage()
    this.player.position = newPlayerPos
    this.player.tile.pos = newPlayerPos
  }
}
