import Color from './Color'
import Layer from './Layer'
import Renderer from './Renderer'
import Tile from './Tile'
import Vector from './Vector'

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

const backgroundTiles = Array.from({ length: WIDTH * HEIGHT }, (_, i) => {
  const x = i % WIDTH
  1
  const y = Math.floor(i / WIDTH)

  return new Tile({
    char: x === 0 || x === WIDTH - 1 ? '#' : y === 0 || y === HEIGHT - 1 ? '#' : '.',
    pos: new Vector(x, y),
  })
})

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
      player.pos.add(new Vector(0, -1))
      draw()
      break
    }
    case 'ArrowDown': {
      player.pos.add(new Vector(0, 1))
      draw()
      break
    }
    case 'ArrowLeft': {
      player.pos.add(new Vector(-1, 0))
      draw()
      break
    }
    case 'ArrowRight': {
      player.pos.add(new Vector(1, 0))
      draw()
      break
    }
  }
})

