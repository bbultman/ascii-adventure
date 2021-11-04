import Color from "./Color";
import { GameViews } from "./index";
import Mob from "./Mob";
import { makeGroundTile, makeSolidTile } from "./Objects";
import Player from "./Player";
import Tile from "./Tile";
import Vector from "./Vector";

const WIDTH = 80;
const HEIGHT = 24;

const vectorExpand = (size: Vector) =>
  Array.from(
    { length: size.y * size.x },
    (_, i) => new Vector(i % size.x, Math.floor(i / size.x))
  );

const buildSquare = (size: Vector) => {
  const numberPossibleDoorPositions = (size.x - 2) * 2 + (size.y - 2) * 2;

  let totalDoors = (numberPossibleDoorPositions / 10) * Math.random() + 1;

  const roomTiles = vectorExpand(size).map((pos, i) => {
    const isCorner =
      (pos.x === 0 && (pos.y === 0 || pos.y === size.y - 1)) ||
      (pos.x === size.x - 1 && (pos.y === 0 || pos.y === size.y - 1));

    const isEdge =
      !isCorner &&
      (pos.x === 0 ||
        pos.y === 0 ||
        pos.y === size.y - 1 ||
        pos.x === size.x - 1);
    //const doorSeed = Math.sin(i * totalDoors * Math.random())
    //const isDoor = isEdge ? doorSeed > 0.9 : false

    //if (isEdge) {
    //  console.log(i, pos, doorSeed, isDoor)
    //}

    return isCorner
      ? makeSolidTile({ pos, char: "^" })
      : isEdge
      ? makeSolidTile({ pos })
      : makeGroundTile({ pos, char: "." });
  });

  return roomTiles;
};

const getTile = (tiles: Tile[], pos: Vector) => {
  return tiles[vectorToTileIndex(pos)];
};

const mergeTiles = (base: Tile[], addition: Tile[], pos: Vector): void => {
  addition.forEach((newTile) => {
    base[vectorToTileIndex(newTile.pos.add(pos))] = newTile;
  });
};

const vectorToTileIndex = ({ x, y }: Vector) => y * WIDTH + x;

const generateBackgroundTiles = (size: Vector) => {
  const background = vectorExpand(size).map((pos: Vector, index: number) => {
    const rand = Math.random();
    const shouldBeSolid = index % 10 === 0 && rand < 0.1;

    const isEdge =
      pos.x === 0 || pos.x === WIDTH - 1 || pos.y === 0 || pos.y === HEIGHT - 1;

    if (isEdge) return makeSolidTile({ pos });
    if (shouldBeSolid) return makeSolidTile({ pos });

    return makeGroundTile({ pos, char: "." });
  });

  const room = buildSquare(new Vector(5, 4));

  mergeTiles(background, room, new Vector(WIDTH / 2, HEIGHT / 2));

  return background;
};

const writeIntoTiles = (input: string, target: Tile[], pos: Vector) => {
  const tiles = input
    .split("")
    .map((char, x) => new Tile({ char, pos: new Vector(x, 0) }));

  mergeTiles(target, tiles, pos);
};

const generateInfoTiles = (size: Vector, player: Player) => {
  const infoTiles = vectorExpand(size).map((pos) => new Tile({ pos }));

  const borderTiles = vectorExpand(new Vector(WIDTH, 1)).map(
    (pos) => new Tile({ char: "-", pos, color: new Color(255, 255, 255, 0.5) })
  );

  mergeTiles(infoTiles, borderTiles, Vector.Zero());

  const xOffset = 1;
  const statRow = 3;
  const statWidth = 7;
  const statLabels = [
    `Str ${player.stats.strength}`,
    `Dex ${player.stats.dexterity}`,
    `Per ${player.stats.perception}`,
    `Int ${player.stats.intelligence}`,
    `Wis ${player.stats.wisdom}`,
  ];

  statLabels.forEach((stat, index) => {
    writeIntoTiles(
      stat,
      infoTiles,
      new Vector(index * statWidth + xOffset, statRow)
    );
  });

  const xpLabel = `Xp ${player.experience}`;

  writeIntoTiles(
    xpLabel,
    infoTiles,
    new Vector(WIDTH - Math.max(statWidth, xpLabel.length + 1), statRow)
  );

  const hpLabel = `Hp ${player.hp}/${player.maxHp}`;

  writeIntoTiles(
    hpLabel,
    infoTiles,
    new Vector(
      statLabels.length + statLabels.length * (xOffset + statWidth),
      statRow
    )
  );

  return infoTiles;
};

export default class World {
  private gameViews: GameViews;
  info: Tile[];
  readonly background: Tile[];
  readonly player: Player;
  readonly mobs: Mob[];
  drawToBuffer: () => void;
  clearFromBuffer: (layer: string, tile: Tile) => void;

  constructor(
    gameViews: GameViews,
    drawFn: () => void,
    clearFn: (layer: string, tile: Tile) => void
  ) {
    this.player = new Player({
      background: new Color(0, 0, 0, 0),
      char: "@",
      color: new Color(255, 0, 0, 1),
      pos: new Vector(5, 5),
      maxHp: 10,
    });

    this.gameViews = gameViews;
    this.background = generateBackgroundTiles(gameViews.main.size);
    this.info = generateInfoTiles(gameViews.info.size, this.player);
    this.drawToBuffer = drawFn;
    this.clearFromBuffer = clearFn;
    this.mobs = Array.from({
      length: gameViews.main.size.x * gameViews.main.size.y,
    });

    const mob = new Mob({
      name: "Znarf",
      pos: new Vector(4, 4),
      hp: 1,
      char: "z",
      color: new Color(255),
      background: new Color(0, 0, 0, 1),
    });

    this.mobs[vectorToTileIndex(mob.position)] = mob;
  }

  gameMessage(message: string) {
    const padding = 2;
    const xOffset = 1;
    [
      message.substring(0, WIDTH - padding),
      message.substring(WIDTH - padding, (WIDTH - 1) * 2),
    ].forEach((line, yIndex) => {
      line.split("").forEach((char, xIndex) => {
        this.info[WIDTH * (yIndex + 1) + xIndex + xOffset].char = char;
      });
    });
  }

  getSurroundingTiles(pos: Vector) {
    return [
        pos.clone().add(new Vector(1, 0)),
        pos.clone().add(new Vector(-1, 0)),
        pos.clone().add(new Vector(0, 1)),
        pos.clone().add(new Vector(0, -1)),
      ]
  }

  clearGameMessage() {
    Array.from({ length: WIDTH }, (_, i) => {
      this.info[WIDTH + i].char = " ";
      this.info[WIDTH * 2 + i].char = " ";
    });
  }

  getMob(pos: Vector) {
    return this.mobs[vectorToTileIndex(pos)];
  }

  deleteMob(pos: Vector) {
    this.clearFromBuffer("actor", this.getMob(pos).tile);
    this.mobs.splice(vectorToTileIndex(pos), 1, undefined);
  }

  handleMobMovement() {
    this.mobs.forEach((M) => {
      if (!M) return;
      const oldPosition = M.position.clone()
      this.mobs.splice(vectorToTileIndex(oldPosition), 1, undefined)

      const newPosition = M.move(this.getSurroundingTiles(oldPosition));

      console.log('newMobPosition', newPosition)

      this.mobs[vectorToTileIndex(newPosition)] = M
    });
  }

  // TODO This is actally a "turn", not just move player.
  movePlayer(pos: Vector) {
    const newPlayerPos = this.player.position.clone().add(pos);
    const positionIndex = vectorToTileIndex(newPlayerPos);

    const M = this.mobs[positionIndex];

    if (M) {
      this.player.hp--;
      const mobChar = M.fullName;
      // TODO How much dmg, of what type?
      M.hp--;

      if (M.dead) {
        this.player.experience++;
        this.info = generateInfoTiles(this.gameViews.info.size, this.player);
        this.gameMessage(`Killed ${mobChar}! Gained 1 xp`);
        this.deleteMob(newPlayerPos);
      } else {
        this.info = generateInfoTiles(this.gameViews.info.size, this.player);
        // Attack!
        this.gameMessage(
          `Attacking ${M.tile.char} ${newPlayerPos.x}:${newPlayerPos.y}`
        );
      }

      this.drawToBuffer();
      return;
    }

    const backgroundTile = getTile(this.background, newPlayerPos);

    if (backgroundTile.isSolid) {
      this.gameMessage("You hit the wall...Ouch!");
      this.drawToBuffer();
      return;
    }

    this.handleMobMovement()
    this.clearGameMessage();
    this.player.position = newPlayerPos;
    this.player.tile.pos = newPlayerPos;
    this.drawToBuffer();
  }
}
