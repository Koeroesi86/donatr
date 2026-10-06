# [donatr.eu](https://donatr.eu) [![CI](https://github.com/Koeroesi86/donatr/actions/workflows/ci.yml/badge.svg)](https://github.com/Koeroesi86/donatr/actions/workflows/ci.yml)

A platform to help donations reach the place where they are most needed.

Let's help Ukraine! 🕊

### Dependencies
* npm
* NodeJS (LTS, see `.nvmrc` — run `nvm use`)

**Build**
```shell script
npm run build
```

**Run locally**
```shell script
npm start
```

**Test** (lint, type check and unit tests)
```shell script
npm test
```

Jest runs through `npm run jest`, which enables Node's `--experimental-vm-modules`. Several dependencies are ESM-only and need it, so set `NODE_OPTIONS=--experimental-vm-modules` when running jest from an IDE.