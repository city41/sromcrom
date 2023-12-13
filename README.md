# sromcrom

A tool for converting modern graphic formats into the binary rom formats needed for a Neo Geo game, as well as emitting code for integrating the graphics into your game.

Sromcrom understands all srom and crom limitations and features, such as eyecatcher and other srom specifics, as well as crom auto animations.

Sromcrom allows you to generate code using handlebars templates, so it has almost no assumptions about how your codebase is. You should be able to adopt sromcrom to emit any kind of code to meet your needs, in any language (ie C, assembly, C++, etc).

## Features

- complete eyecatcher support.
- ensures the srom and crom tiles at 0xFF are empty as required by the system
  - this assurance is met whether or not you specify an eyecatcher
- crom auto animation tiles are placed at proper boundaries
- tile deduping for both srom and crom
- frame based crom animations
- tileset auto animations
  - tilesets are typically used to from backgrounds
- merging of palettes
- ensures the first color of palette zero is the required black
- code generation via handlebars templates

### Features to come

- alternate palettes
- frame based srom animations
- documentation

I would love to expand sromcrom into a full gui application that really lets you manage your graphics. But that is a huge endeavour so who knows if I'll ever do it. Sromcrom's codebase was written with this use case in mind.

## Status

I am actively using sromcrom to build the Neo Geo game I am working on. It works quite well but I am going to keep building my game for a while and harden sromcrom in the process. Once I am confident sromcrom is stable and meets all use cases, I will write documentation and release a 1.0 version.

# Installation

You need [nodejs](https://nodejs.org/en), at least version 18.

Then...

```bash
npm install -g @city41/sromcrom
```

Test it is installed

```bash
sromcrom -V
```

# Usage

TODO. In the mean time, I am also writing a [Neo Geo dev book](https://github.com/city41/neo-geo-dev-book) that uses sromcrom throughout.

# Development

## Publishing

sromcrom uses [semantic versioning](https://semver.org/)

Publishing a new version is done by bumping the version in package.json

```bash
yarn version
yarn version v1.22.19
info Current version: 0.4.0
question New version: 0.4.1
info New version: 0.4.1
Done in 16.19s.

git push
git push --tags
```

Once [the Publish action](https://github.com/city41/sromcrom/actions/workflows/publish.yml) notices the version has changed, it will run a build and publish to npm.
