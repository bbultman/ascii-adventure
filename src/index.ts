import Layer from "./Layer";
import { makeGroundTile, makeSolidTile } from "./Objects";
import Renderer from "./Renderer";
import Vector from "./Vector";
import World from "./World";
import buildInputHandler from "./Input";

const WIDTH = 80;
const HEIGHT = 24;

const getDistance = (v1: Vector, v2: Vector) =>
  Math.round(Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2)));

type GameView = {
  name: string;
  size: Vector;
  layers: Layer[];
};

export type GameViews = {
  main: GameView;
  info: GameView;
};

const gameViews: GameViews = {
  main: {
    name: "background",
    size: new Vector(WIDTH, HEIGHT),
    layers: [
      new Layer({ name: "background", size: new Vector(WIDTH, HEIGHT) }),
      new Layer({ name: "actor", size: new Vector(WIDTH, HEIGHT) }),
    ],
  },
  info: {
    name: "info",
    size: new Vector(WIDTH, 10),
    layers: [
      new Layer({
        name: "info",
        size: new Vector(WIDTH, 5),
        pos: new Vector(0, HEIGHT),
      }),
    ],
  },
};

const renderer = new Renderer(gameViews);

renderer.onBeforeDraw(function (layer: Layer) {
  console.log('before draw, operation count', this.operations)
  if (layer.name === "info") return

  layer.operations.forEach((tile) => {
    if (layer.name === "background") {
      if (
        tile.pos.y === world.player.position.y &&
        tile.pos.x === world.player.position.x
      ) {
        // Dont render ground under char's feet
        tile.color.a = 0;
      }
    }

    // TODO Figure out how to make 'light' respect solid tiles (vector angle calculations?)
    // TODO Make this generic so it can be applied on objects as well
    const playerTileDistance = getDistance(world.player.position, tile.pos);

    if (playerTileDistance > 10) {
      tile.isVisible = false;
      return;
    }

    if (playerTileDistance > 5) {
      tile.isVisible = true;
      tile.color.a = 0.4;
      return;
    }

    tile.isVisible = true;
  });
});

const draw = () => {
  renderer.drawAll("background", world.background);
  renderer.draw("actor", world.player.tile);
  renderer.drawAll(
    "actor",
    world.mobs.map((mob) => mob && mob.tile)
  );
  renderer.drawAll("info", world.info);
  renderer.commit();
};

const world = new World(gameViews, draw, renderer.drop.bind(renderer));

let ready = false;

document.addEventListener("keydown", buildInputHandler(world));
document.addEventListener("readystatechange", () => {
  if (!ready) {
    ready = true;
    draw();
  }
});
