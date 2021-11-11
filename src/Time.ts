import { EventEmitter } from './EventEmitter'

const log = (...x) => {
  if (true) console.log('TIME ->', ...x)
}

enum TimeEvents {
  START = 'START',
  TURN = 'TURN',
  TICK = 'TICK',
  END = 'END',
}

class TimeEmitter extends EventEmitter<typeof TimeEvents> {
  private _turnCounter = 0

  constructor() {
    super()

    this.on(TimeEvents.TICK, () => {
      this._turnCounter++
      log(this._turnCounter)
    })
  }

  getTurns() {
    return this._turnCounter
  }
}

const Time = new TimeEmitter()

export { TimeEvents, Time }
