import Vector from "./Vector";
import World from "./World";

enum Actions {
  MV_UP = "MV_UP",
  MV_DOWN = "MV_DOWN",
  MV_LEFT = "MV_LEFT",
  MV_RIGHT = "MV_RIGHT",
}

export default (world: World) => {
  const handleKeydown = (action: Actions) => {
    switch (action) {
      case Actions.MV_UP: {
        world.movePlayer(new Vector(0, -1));
        break;
      }
      case Actions.MV_DOWN: {
        world.movePlayer(new Vector(0, 1));
        break;
      }
      case Actions.MV_LEFT: {
        world.movePlayer(new Vector(-1, 0));
        break;
      }
      case Actions.MV_RIGHT: {
        world.movePlayer(new Vector(1, 0));
        break;
      }
    }
  };

  const domKeyHandler = (e) => {
    switch (e.key) {
      case "k":
      case "ArrowUp": {
        handleKeydown(Actions.MV_UP);
        break;
      }
      case "j":
      case "ArrowDown": {
        handleKeydown(Actions.MV_DOWN);
        break;
      }
      case "h":
      case "ArrowLeft": {
        handleKeydown(Actions.MV_LEFT);
        break;
      }
      case "l":
      case "ArrowRight": {
        handleKeydown(Actions.MV_RIGHT);
        break;
      }
    }
  };

  return domKeyHandler;
};