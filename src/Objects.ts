import Tile, { TileConstructorOptions } from './Tile'

export const makeSolidTile = (opts?: Partial<TileConstructorOptions>) => new Tile({ char: '#', isSolid: true, ...opts })
export const makeGroundTile = (opts?: Partial<TileConstructorOptions>) =>
  new Tile({
    char: '.',
    ...opts,
    isSolid: false,
  })

export const makeMobTile = (opts?: Partial<TileConstructorOptions>) => new Tile({ char: 'm', isSolid: true, ...opts })
