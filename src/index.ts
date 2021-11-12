import Layer, { Camera } from './Layer'
import { makeGroundTile, makeSolidTile } from './Objects'
import Renderer from './Renderer'
import Vector from './Vector'
import World from './World'
import buildInputHandler from './Input'
import { Time, TimeEvents } from './Time'
import { handlePlayerAction } from './Actions'
import Inventory from './Inventory'

const log = (...x) => {
  if (false) console.log('INDEX ->', ...x)
}

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

const inventoryLayer = new Layer({ name: 'inventory', size: new Vector(WIDTH, HEIGHT), opacity: 0 })

const gameViews: GameViews = {
  main: {
    name: 'background',
    size: new Vector(WIDTH, HEIGHT),
    layers: [
      new Layer({ name: 'background', size: new Vector(WIDTH, HEIGHT) }),
      new Layer({
        name: 'actor',
        camera: new Camera(Vector.Zero(), new Vector(20, HEIGHT)),
        size: new Vector(WIDTH, HEIGHT),
      }),
      inventoryLayer,
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
const playerCam = gameViews.main.layers.find((x) => x.name === 'actor').camera

renderer.onBeforeDraw(function (layer: Layer) {
  const playerPos = world.player.position.clone()
  const lightRadius = world.player.sightDistance

  if (layer.name === 'info') return

  layer.operations.forEach((op) => {
    if (layer.name === 'inventory') return
    if (layer.name === 'background') {
      if (op.pos.y === world.player.position.y && op.pos.x === world.player.position.x) {
        // Dont render ground under char's feet
        op.color.a = 0
      }
    }

    const tileInCameraView = playerCam.canSee(op.pos)

    if (!tileInCameraView) {
      op.isVisible = false
      return
    }

    // TODO Figure out how to make 'light' respect solid tiles (vector angle calculations?)
    // TODO Make this generic so it can be applied on objects as well
    const playerTileDistance = getDistance(playerPos, op.pos)

    if (playerTileDistance > lightRadius) {
      op.isVisible = false
      return
    }


    if (playerTileDistance <= lightRadius && playerTileDistance > 0) {
      op.isVisible = true
      const alpha = 1 - playerTileDistance * 0.15

      op.color.a = alpha
      return
    }

    op.isVisible = true
  })
})

const world = new World(gameViews, renderer.drop.bind(renderer))
const inventory = new Inventory(inventoryLayer, new Vector(WIDTH, HEIGHT))
const playerActionHandler = handlePlayerAction(world, inventory)
const keyboardHandler = buildInputHandler(playerActionHandler)

let ready = false

document.addEventListener('keydown', keyboardHandler)
document.addEventListener('readystatechange', () => {
  if (!ready) {
    ready = true

    const playerCam = gameViews.main.layers.find((x) => x.name === 'actor').camera

    Time.on(TimeEvents.START, () => renderer.drawAll('background', world.background))
    Time.on(TimeEvents.START, () => renderer.drawAll('info', world.info))

    Time.on(TimeEvents.TURN, world.movePlayer.bind(world))
    Time.on(TimeEvents.TURN, () => playerCam.moveCamera(world.playerMove))
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
