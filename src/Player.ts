import Color from "./Color";
import Tile from "./Tile";
import Vector from "./Vector";

type PlayerOptions = {
  background: Color;
  char: string;
  color: Color;
  pos: Vector;
  stats: PlayerStats
  hp: number
  maxHp: number
};

type PlayerStats = {
  strength: number;
  dexterity: number;
  intelligence: number;
  perception: number;
  wisdom: number;
};

export default class Player {
  tile: Tile;
  position: Vector;
  stats: PlayerStats;
  private _experience: number;
  hp: number;
  maxHp: number;

  constructor({ background, char, color, pos, stats = {}, maxHp }) {
    this.tile = new Tile({
      background,
      char,
      color,
      isVisible: true,
      isSolid: true,
      pos,
    });

    this.stats = {
      strength: 1,
      dexterity: 1,
      intelligence: 1,
      perception: 1,
      wisdom: 1,
      ...stats,
    };

    this.position = pos;
    this.maxHp = maxHp;
    this.hp = this.maxHp;

    this._experience = 0;
  }

  get experience() { return this._experience }
  set experience(value: number) { this._experience = value }
}
