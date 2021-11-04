import { GameViews } from "./index";
import Layer from "./Layer";
import Tile from "./Tile";

type RendererParams = GameViews;

export default class Renderer {
  namedLayers: Record<string, Layer> = {};
  private layers: Array<Layer> = [];
  private layerElements: Record<string, HTMLElement> = {};
  private size: number = 30;
  private beforeDraw: (layer: Layer) => void;

  operations: number = 0
  frames: number = 0;

  constructor(views: RendererParams) {
    views.main.layers.forEach((layer) => this.addLayer(layer));
    views.info.layers.forEach((layer) => this.addLayer(layer));
  }

  setSize(n: number) {
    this.size = n;
  }

  addLayer(layer: Layer) {
    if (layer.name in this.namedLayers) {
      return new Error(`${name} layer already attached to renderer`);
    }
    this.namedLayers[layer.name] = layer;
    this.layers.push(layer);

    this.orderLayers();

    return this;
  }

  onBeforeDraw(cb: (layer: Layer) => void) {
    this.beforeDraw = cb;
  }

  // TODO Only draw tiles that have changed since last frame
  draw(layerName: string, tile: Tile) {
    if (!tile) return
    this.namedLayers[layerName].draw(tile);
  }

  drawAll(layerName: string, tiles: Tile[]) {
    tiles.forEach((tile) => this.draw(layerName, tile));
  }

  drop(layerName: string, tile: Tile) {
    this.namedLayers[layerName].drop(tile)
  }

  commit() {
    this.layers.forEach((layer) => {
      this.beforeDraw(layer);
    });

    for (let [name, layer] of Object.entries(this.namedLayers)) {
      let layerEl = this.layerElements[name];

      if (!layerEl) {
        layerEl = document.createElement("div");
        layerEl.classList.add("asc-engine-layer");
        layerEl.style.fontSize = `${this.size / 1.1}px`;
        layerEl.style.top = `${layer.pos.y * this.size}px`;
        layerEl.style.left = `${(layer.pos.x * this.size) / 2}px`;
        layerEl.style.height = `${layer.size.y * this.size}px`;
        layerEl.style.width = `${(layer.size.x * this.size) / 2}px`;
        layerEl.style.zIndex = layer.z.toString();

        document
          .getElementById("asc-engine-layer-container")
          .appendChild(layerEl);
        this.layerElements[name] = layerEl;
      }

      for (let op of layer.operations) {
        let opEl = document.getElementById(`asc-engine-tile-${op.tile.id}`);

        if (op.delete === true) {
          layerEl.removeChild(
            document.getElementById(`asc-engine-tile-${op.tile.id}`)
          );
        }

        if (!opEl) {
          opEl = document.createElement("div");
          opEl.classList.add("asc-engine-tile");
          opEl.id = `asc-engine-tile-${op.tile.id}`;

          layerEl.appendChild(opEl);
        }

        opEl.innerHTML = op.char.replace(/ /g, "&nbsp;");
        opEl.style.top = `${op.pos.y * this.size}px`;
        opEl.style.left = `${(op.pos.x * this.size) / 2}px`;
        opEl.style.display = "block";

        if (op.isVisible) {
          opEl.style.color = op.color.toCssString();
          opEl.style.backgroundColor = op.background.toCssString();
        } else {
          opEl.style.color = "black";
          opEl.style.backgroundColor = "black";
        }

        this.operations++
      }

      layer.clear();
    }

    this.frames++;
  }

  private orderLayers() {
    this.layers = this.layers.sort((la, lb) => la.z - lb.z);
  }
}
