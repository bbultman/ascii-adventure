import { EventEmitter } from './EventEmitter'

enum TimeEvents {
  START = 'START',
  TICK = 'TICK',
  END = 'END',
}

class TimeEmitter extends EventEmitter<typeof TimeEvents> {
  private _turnCounter = 0
  getTurns() {
    return this._turnCounter
  }

  constructor() {
    super()

    this.on(TimeEvents.TICK, () => {
      this._turnCounter++
      console.log('TIME', this._turnCounter)
    })
  }
}

const Time = new TimeEmitter()

export { TimeEvents, Time }
