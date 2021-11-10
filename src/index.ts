import Layer from './Layer'
import { makeGroundTile, makeSolidTile } from './Objects'
import Renderer from './Renderer'
import Vector from './Vector'
import World from './World'
import buildInputHandler from './Input'
import { Time, TimeEvents } from './Time'

const WIDTH = 80
const HEIGHT = 24

const getDistance = (v1: Vector, v2: Vector) =>
  Math.round(Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2)))

type GameView = {
  name: string
  size: Vector
  layers: Layer[]
}

export type GameViews = {
  main: GameView
  info: GameView
}

const gameViews: GameViews = {
  main: {
    name: 'background',
    size: new Vector(WIDTH, HEIGHT),
    layers: [
      new Layer({ name: 'background', size: new Vector(WIDTH, HEIGHT) }),
      new Layer({ name: 'actor', size: new Vector(WIDTH, HEIGHT) }),
    ],
  },
  info: {
    name: 'info',
    size: new Vector(WIDTH, 10),
    layers: [
      new Layer({
        name: 'info',
        size: new Vector(WIDTH, 5),
        pos: new Vector(0, HEIGHT),
      }),
    ],
  },
}

const renderer = new Renderer(gameViews)

renderer.onBeforeDraw(function (layer: Layer) {
  const playerPos = world.player.position.clone()

  if (layer.name === 'background') {
    layer.operations
      .filter((x) => x.tile.isCorner)
      .forEach((c) => {
        const intensity = getDistance(playerPos, c.pos)
        console.log('Distance to corner', intensity, c.pos)
        c.background.b = 255
      })
  }

  if (layer.name === 'info') return

  layer.operations.forEach((op) => {
    if (layer.name === 'background') {
      if (op.pos.y === world.player.position.y && op.pos.x === world.player.position.x) {
        // Dont render ground under char's feet
        op.color.a = 0
      }
    }

    // TODO Figure out how to make 'light' respect solid tiles (vector angle calculations?)
    // TODO Make this generic so it can be applied on objects as well
    const playerTileDistance = getDistance(playerPos, op.pos)

    if (playerTileDistance > 10) {
      op.isVisible = false
      return
    }

    if (playerTileDistance > 5) {
      op.isVisible = true
      op.color.a = 0.4
      return
    }

    op.isVisible = true
  })
})

const world = new World(gameViews, renderer.drop.bind(renderer))

let ready = false

document.addEventListener('keydown', buildInputHandler(world))
document.addEventListener('readystatechange', () => {
  if (!ready) {
    ready = true

    Time.on(TimeEvents.TICK, world.movePlayer.bind(world))
    Time.on(TimeEvents.TICK, world.handleMobMovement.bind(world))
    Time.on(TimeEvents.TICK, () => {
      renderer.drawAll('background', world.background)
      renderer.draw('actor', world.player.tile)
      renderer.drawAll(
        'actor',
        world.mobs.map((mob) => mob && mob.tile)
      )
      renderer.drawAll('info', world.info)
      renderer.commit()
    })

    Time.emit(TimeEvents.START)
    Time.emit(TimeEvents.TICK)

    window.gameTime = Time
  }
})
