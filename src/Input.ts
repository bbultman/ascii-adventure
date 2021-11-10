import { Time, TimeEvents } from './Time'
import Vector from './Vector'
import World from './World'

enum Actions {
  NOOP = 'NOOP',
  MV_UP = 'MV_UP',
  MV_DOWN = 'MV_DOWN',
  MV_LEFT = 'MV_LEFT',
  MV_RIGHT = 'MV_RIGHT',
}

export default (world: World) => {
  const handleKeydown = (action: Actions) => {
    let playerMove: Vector

    switch (action) {
      case Actions.MV_UP: {
        playerMove = new Vector(0, -1)
        break
      }
      case Actions.MV_DOWN: {
        playerMove = new Vector(0, 1)
        break
      }
      case Actions.MV_LEFT: {
        playerMove = new Vector(-1, 0)
        break
      }
      case Actions.MV_RIGHT: {
        playerMove = new Vector(1, 0)
        break
      }
      case Actions.NOOP: {
        playerMove = Vector.Zero()
        break
      }
      default: {
        playerMove = Vector.Zero()
      }
    }

    world.setPlayerMove(playerMove)
    Time.emit(TimeEvents.TICK)
  }

  const domKeyHandler = (e) => {
    switch (e.key) {
      case 'k':
      case 'ArrowUp': {
        handleKeydown(Actions.MV_UP)
        break
      }
      case 'j':
      case 'ArrowDown': {
        handleKeydown(Actions.MV_DOWN)
        break
      }
      case 'h':
      case 'ArrowLeft': {
        handleKeydown(Actions.MV_LEFT)
        break
      }
      case 'l':
      case 'ArrowRight': {
        handleKeydown(Actions.MV_RIGHT)
        break
      }
      case '5': {
        handleKeydown(Actions.NOOP)
        break
      }
    }
  }

  return domKeyHandler
}
