# Hardhat + OpenZeppelin Stylus examples

Node project to compile and test Stylus examples using `@cobuilders/hardhat-arbitrum-stylus`.

## Quick start

```sh
npm install
npm run prepare:hardhat
npm test
```

## Details

See [HARDHAT.md](./HARDHAT.md) for setup, available scripts, and the list of examples that don't have Hardhat tests (with explanations).

Those examples are **not deleted** from the Rust repo — they still live under `contracts/` → `../examples`. They just lack `test/openzeppelin/*.test.ts` files because the plugin's `export-abi` path doesn't produce a usable ABI for them. See HARDHAT.md for details.
