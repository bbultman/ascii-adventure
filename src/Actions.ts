import Inventory from './Inventory'
import { Time, TimeEvents } from './Time'
import Vector from './Vector'
import World from './World'

const log = (...x) => {
  if (true) console.log('ACTIONS', ...x)
}

export enum PlayerActions {
  NOOP = 'NOOP',
  MV_UP = 'MV_UP',
  MV_DOWN = 'MV_DOWN',
  MV_LEFT = 'MV_LEFT',
  MV_RIGHT = 'MV_RIGHT',
  INVENTORY_TOGGLE = 'INVENTORY_TOGGLE',
}

export const handlePlayerAction = (world: World, inv: Inventory) => (action: PlayerActions) => {
  let playerMove = Vector.Zero()

  log(action)

  switch (action) {
    case PlayerActions.MV_UP: {
      playerMove = new Vector(0, -1)
      break
    }
    case PlayerActions.MV_DOWN: {
      playerMove = new Vector(0, 1)
      break
    }
    case PlayerActions.MV_LEFT: {
      playerMove = new Vector(-1, 0)
      break
    }
    case PlayerActions.MV_RIGHT: {
      playerMove = new Vector(1, 0)
      break
    }
    case PlayerActions.INVENTORY_TOGGLE: {
      // This action should be defined on the Inventory so we can override all actions somewhat based on the UI components.
      inv.layer.opacity = inv.layer.opacity === 0 ? 1 : 0
      inv.render()
      break
    }
    default: {
      log('No action taken for Player Action', action)
    }
  }

  world.setPlayerMove(playerMove)

  // Push time forwards by 1, triggers render
  Time.emit(TimeEvents.TICK)
}
