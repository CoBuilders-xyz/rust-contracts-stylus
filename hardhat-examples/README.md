# Hardhat + OpenZeppelin Stylus examples

Node project to compile and test OpenZeppelin Stylus examples using `@cobuilders/hardhat-arbitrum-stylus`.

## Quick start

```sh
npm install
npm run prepare:hardhat
npm test
```

## What happens

1. `npm install` copies the Rust example crates from `../examples` into `contracts/` (no symlinks).
2. `prepare:hardhat` generates a standalone Cargo workspace so the copied crates can compile independently.
3. `npm test` deploys each contract to a local Stylus node and runs integration tests via viem.

## Details

See [HARDHAT.md](./HARDHAT.md) for the full script reference, constructor arg caveats, and the list of examples that don't have tests (with explanations for each).
