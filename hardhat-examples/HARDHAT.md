# Hardhat + Stylus examples

Sub-project in `hardhat-examples/`. The plugin resolves `./contracts` relative to **this folder**. In the repo root, `contracts/` is the OpenZeppelin crate — not the examples — so here `contracts/` is a symlink to `../examples`.

## Requirements

- Node 22+
- Docker (Nitro / tooling used by `@cobuilders/hardhat-arbitrum-stylus`)
- Build WASM from the **repo root** (`rust-contracts-stylus/`):

  ```sh
  cd ..   # repo root, parent of hardhat-examples/
  cargo build --release --target wasm32-unknown-unknown \
    -Z build-std=std,panic_abort \
    -Z build-std-features=panic_immediate_abort
  ```

## Usage

```sh
cd hardhat-examples
npm install
npm run prepare:hardhat
npm run compile:ci    # or npm run compile for all examples
npm test
```

If you previously ran `npm install` at the repo root (`rust-contracts-stylus/`), delete `node_modules/` and any stale `package-lock.json` there — the Node project lives exclusively in `hardhat-examples/`.

If `postinstall` reports that `hardhat-examples/contracts/` is a regular folder, delete it and re-run `npm install` so the symlink to `../examples` can be created.

Examples are **workspace members** of the repo root (`Cargo.toml` in `rust-contracts-stylus/`). Recent versions of **cargo-stylus** look for `Stylus.toml` in that root when validating a member; `prepare:hardhat` copies a minimal `Stylus.toml` there in addition to each example (the root copy is in `.gitignore` because the script generates it).

| Script               | What it does                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `postinstall`        | Creates `contracts` → `../examples` if possible                                                                                          |
| `prepare:hardhat`    | Copies `hardhat-stylus/` into each example, places `Stylus.toml` at the **repo root** (Cargo workspace), links `.wasm` from `../target/` |
| `compile`            | prepare + compile all Stylus crates under `contracts/`                                                                                   |
| `compile:ci`         | Same as `compile:all` (all detected examples; aligned with `npm test`)                                                                   |
| `compile:all`        | prepare + explicit list of all detected examples                                                                                         |
| `compile:erc20` etc. | Single crate                                                                                                                             |
| `deploy:*`           | `hardhat arb:deploy --host …`                                                                                                            |
| `npm test`           | Runs `scripts/hardhat-run-all-tests.mjs` (every `test/openzeppelin/*.test.ts`)                                                           |

## Constructor args and shell-based deploy

`stylusViem.deployContract` ultimately invokes `cargo stylus deploy` with constructor arguments passed through a **single shell command string** (`exec` + `shell: true`). This has two practical implications for tests:

1. **Avoid spaces** in constructor strings (name, symbol, URIs, etc.). A value like `Test Token` splits into separate shell arguments and `cargo stylus` receives the wrong arg count.
2. **Empty arrays**: don't pass `[]` in JS as an array element (it becomes `""` and may be lost). For the consecutive example, use string literals like `'[]'` for `address[]` / `uint96[]` empties, in the format alloy/cargo stylus expects.

## OpenZeppelin tests (`test/openzeppelin/`)

Each suite performs a **real deploy** against the plugin's local Stylus node and then exercises whatever `cargo stylus export-abi` exposes (what viem sees on the client). That's why you'll see `mint`, `pause`, `verify`, etc., but not always `balanceOf`/`name` if they aren't in that ABI. For full read access, run `npm run compile` first to generate artifacts.

- `test-helpers.ts` — shared constants: `STYLUS_LOCAL_CHAIN_ID` (412346), `DEFAULT_ADMIN_ROLE`, `transferRole()`, trivial Merkle root.
- Tests check `getChainId()` against the local node and assert `success` receipts after write operations.

## OpenZeppelin examples **without** Hardhat tests

The following crates are still in `contracts/` (symlink to `../examples`) and can be compiled or deployed outside this workflow. There are no `test/openzeppelin/*.test.ts` files for them because deploying via `stylusViem.deployContract` (from the npm plugin) requires **either** an artifact from `arb:compile` **or** an ABI from `cargo stylus export-abi` that the plugin can parse into a **non-empty** JSON ABI. For these crates, `export-abi` produces an interface with only errors (no functions) or a completely empty interface, so the plugin aborts before deploying. The contracts themselves are valid Stylus code — this is a limitation of the export-abi + parser shortcut in the plugin for these patterns (wrappers, holders, beacons, vaults, etc.).

| Crate                | `export-abi` output                 |
| -------------------- | ----------------------------------- |
| `beacon-proxy`       | has functions but reverts on deploy |
| `upgradeable-beacon` | errors only, no functions           |
| `ownable-two-step`   | errors only, no functions           |
| `erc20-wrapper`      | errors only, no functions           |
| `vesting-wallet`     | errors only, no functions           |
| `safe-erc20`         | empty interface                     |
| `erc4626`            | empty interface                     |
| `erc721-wrapper`     | empty interface                     |
| `erc721-holder`      | empty interface                     |
| `erc1155-holder`     | empty interface                     |

To cover these with Hardhat tests, you would need to ensure `arb:compile` generates full artifacts, or improve the export-abi/plugin parser upstream.
