import { PlayerActions } from './Actions'
import { Time, TimeEvents } from './Time'

export default (actionHandler: (action: PlayerActions) => void) => (e) => {
  switch (e.key) {
    case 'k':
    case 'ArrowUp': {
      actionHandler(PlayerActions.MV_UP)
      break
    }
    case 'j':
    case 'ArrowDown': {
      actionHandler(PlayerActions.MV_DOWN)
      break
    }
    case 'h':
    case 'ArrowLeft': {
      actionHandler(PlayerActions.MV_LEFT)
      break
    }
    case 'l':
    case 'ArrowRight': {
      actionHandler(PlayerActions.MV_RIGHT)
      break
    }
    case '5': {
      actionHandler(PlayerActions.NOOP)
      break
    }
    case 'i': {
      actionHandler(PlayerActions.INVENTORY_TOGGLE)
      break
    }
  }
}
