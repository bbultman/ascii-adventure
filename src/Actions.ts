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
  log(action)

  switch (action) {
    case PlayerActions.MV_UP: {
      world.setPlayerMove(new Vector(0, -1))
      Time.emit(TimeEvents.TURN)
      break
    }
    case PlayerActions.MV_DOWN: {
      world.setPlayerMove(new Vector(0, 1))
      Time.emit(TimeEvents.TURN)
      break
    }
    case PlayerActions.MV_LEFT: {
      world.setPlayerMove(new Vector(-1, 0))
      Time.emit(TimeEvents.TURN)
      break
    }
    case PlayerActions.MV_RIGHT: {
      world.setPlayerMove(new Vector(1, 0))
      Time.emit(TimeEvents.TURN)
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

  // Push time forwards by 1, triggers render
  Time.emit(TimeEvents.TICK)
}
