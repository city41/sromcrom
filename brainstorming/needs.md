# NeoGraphics tool needs

## support a subset of possibilities

If the input json only has eyecatcher for example, just build a crom with an eyecatcher in it

## palettes

### merge/minify palettes

- all input images need to contribute to the final palette pool
- allow tiles to share a palette if possible

### alternate palettes

if two images have the same shape but different colors, then they should get reduced to the same tiles so that palette sharing/swapping can occur

## build proper crom binaries

- eyecatcher in specific spot
- auto animations in specific spots
- blank tiles minimized
- tiles deduped

## frame animation

- aseprite files as input
- pngs with col/row frames as input

## terrain/background tiles

- ingest a png: no auto animations supported
- ingest an aseprite: auto animations possible
- convert tiled json to a level def in C (tiledToC)

## dev strategy

- functional, stateless API for most/all operations
- immutable data structures whenever possible
- cli orchestrator that is separate from the api
  - ideally this same codebase can become an electron app
