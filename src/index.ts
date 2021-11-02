import Color from './Color'
import Layer from './Layer'
import { makeGroundTile, makeSolidTile } from './Objects'
import Renderer from './Renderer'
import Tile from './Tile'
import Vector from './Vector'
import World from './World'

const WIDTH = 80
const HEIGHT = 24

const layers: Record<string, Layer> = {
  background: new Layer({ size: new Vector(WIDTH, HEIGHT) }),
  actor: new Layer({ size: new Vector(WIDTH, HEIGHT) }),
}

const player = new Tile({
  background: new Color(0, 0, 0, 0),
  char: '@',
  color: new Color(255, 0, 0),
  isVisible: true,
  pos: new Vector(WIDTH / 2, HEIGHT / 2),
})

const world = new World()

const backgroundTiles = world.tiles

const getDistance = (v1: Vector, v2: Vector) =>
  Math.round(Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2)))

const renderer = new Renderer()
renderer.setSize(20)
renderer.addLayer('background', layers.background)
renderer.addLayer('actor', layers.actor)

renderer.onBeforeDraw(() => {
  layers.background.operations.forEach((tile) => {
    if (tile.pos.y === player.pos.y && tile.pos.x === player.pos.x) {
      // Dont render ground under char's feet
      tile.color.a = 0
    }

    const playerTileDistance = getDistance(player.pos, tile.pos)

    if (playerTileDistance > 10) {
      tile.isVisible = false
      return
    }

    if (playerTileDistance > 5) {
      tile.isVisible = true
      tile.color.a = 0.4
      return
    }

    tile.isVisible = true
  })
})

const draw = () => {
  backgroundTiles.forEach((tile) => layers.background.draw(tile))
  layers.actor.draw(player)
  renderer.commit()
}

let ready = false

document.addEventListener('readystatechange', () => {
  if (!ready) {
    draw()
    ready = true
  }
})

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp': {
      const newPlayerPos = player.pos.clone().add(new Vector(0, -1))
      // How do we get a bg tile by coordinates quicker than O(n)?
      const bgRef = backgroundTiles.find((bg) => bg.pos.x === newPlayerPos.x && bg.pos.y === newPlayerPos.y)

      if (bgRef.isSolid) {
        console.log('Ouch!')
        return
      }

      player.pos = newPlayerPos
      draw()
      break
    }
    case 'ArrowDown': {
      const newPlayerPos = player.pos.clone().add(new Vector(0, 1))
      // How do we get a bg tile by coordinates quicker than O(n)?
      const bgRef = backgroundTiles.find((bg) => bg.pos.x === newPlayerPos.x && bg.pos.y === newPlayerPos.y)

      if (bgRef.isSolid) {
        console.log('Ouch!')
        return
      }

      player.pos = newPlayerPos
      draw()
      break
    }
    case 'ArrowLeft': {
      const newPlayerPos = player.pos.clone().add(new Vector(-1, 0))
      // How do we get a bg tile by coordinates quicker than O(n)?
      const bgRef = backgroundTiles.find((bg) => bg.pos.x === newPlayerPos.x && bg.pos.y === newPlayerPos.y)

      if (bgRef.isSolid) {
        console.log('Ouch!')
        return
      }

      player.pos = newPlayerPos
      draw()
      break
    }
    case 'ArrowRight': {
      const newPlayerPos = player.pos.clone().add(new Vector(1, 0))
      // How do we get a bg tile by coordinates quicker than O(n)?
      const bgRef = backgroundTiles.find((bg) => bg.pos.x === newPlayerPos.x && bg.pos.y === newPlayerPos.y)

      if (bgRef.isSolid) {
        console.log('Ouch!')
        return
      }

      player.pos = newPlayerPos
      draw()
      break
    }
  }
})
