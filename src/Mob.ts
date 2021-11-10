import Color from './Color'
import Tile from './Tile'
import Vector from './Vector'

type MobParams = {
  hp: number
  background: Color
  char: string
  color: Color
  pos: Vector
  name: string
  pronoun?: string
}

export default class Mob {
  private _hp: number
  tile: Tile
  position: Vector
  dead: boolean
  readonly name: string
  readonly pronoun: string

  constructor({ pronoun = 'a', name, hp, background, char, color, pos }: MobParams) {
    this.tile = new Tile({
      background,
      char,
      color,
      isVisible: true,
      isSolid: true,
      pos,
    })

    this.position = pos
    this.pronoun = pronoun
    this.name = name
    this._hp = hp
  }

  get fullName() {
    return `${this.pronoun} ${this.name}`
  }
  get hp() {
    return this._hp
  }
  set hp(value: number) {
    this._hp = value

    if (this._hp <= 0) {
      this.dead = true
    }
  }

  move(matrix: Vector[]) {
    const index = Math.floor(Math.random() * matrix.length)
    const movePos = matrix[index];

    this.moveTo(movePos)

    return this.position
  }

  moveTo(pos: Vector) {
    this.position = pos
    this.tile.pos = this.position
  }
}
