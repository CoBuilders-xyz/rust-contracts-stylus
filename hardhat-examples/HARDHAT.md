# Hardhat + Stylus examples

Sub-project in `hardhat-examples/`. The plugin resolves `./contracts` relative to **this folder**. The `prepare:hardhat` script copies examples from `../examples` into `contracts/` and generates a Cargo workspace so each crate can resolve its dependencies independently from the parent repo workspace.

## Requirements

- Node 22+
- Docker (Nitro / tooling used by `@cobuilders/hardhat-arbitrum-stylus`)
- Rust nightly with `wasm32-unknown-unknown` target (installed automatically via `rust-toolchain.toml`)

## Usage

```sh
cd hardhat-examples
npm install          # copies contracts from ../examples, installs deps
npm run prepare:hardhat   # generates workspace Cargo.toml + metadata
npm test             # deploys and tests each example against a local Stylus node
```

## How it works

1. `npm install` (postinstall) copies `../examples` into `contracts/` (real copy, no symlinks).
2. `prepare:hardhat` generates:
   - `Cargo.toml` workspace at `hardhat-examples/` listing all example crates as members with correct `[workspace.dependencies]` pointing to the parent repo's library crates.
   - `Stylus.toml` and `.cargo/config.toml` (build-std flags) at the workspace root and in each example.
3. `npm test` runs each `test/openzeppelin/*.test.ts` via `hardhat test`. The plugin starts a local Nitro node, compiles each crate with `cargo stylus deploy`, and exposes the deployed contract through viem.

| Script            | What it does                                                                   |
| ----------------- | ------------------------------------------------------------------------------ |
| `postinstall`     | Copies `../examples` → `contracts/`                                            |
| `prepare:hardhat` | Generates workspace `Cargo.toml`, copies toolchain/stylus metadata             |
| `compile`         | prepare + compile all Stylus crates under `contracts/`                         |
| `compile:ci`      | Same as `compile:all`                                                          |
| `npm test`        | Runs `scripts/hardhat-run-all-tests.mjs` (every `test/openzeppelin/*.test.ts`) |

## Constructor args and shell-based deploy

`stylusViem.deployContract` invokes `cargo stylus deploy` with constructor arguments passed through a **single shell command string** (`exec` + `shell: true`). Two implications:

1. **Avoid spaces** in constructor strings (name, symbol, URIs). `Test Token` splits into separate shell args.
2. **Empty arrays**: use string literals like `'[]'` instead of JS `[]` (which becomes `""` in shell).

## OpenZeppelin tests (`test/openzeppelin/`)

Each suite does a **real deploy** against the plugin's local Stylus node and exercises functions exposed by `cargo stylus export-abi`. Tests check `getChainId()` and assert `success` receipts after write operations.

## OpenZeppelin examples without Hardhat tests

### Reason: `export-abi` produces empty or error-only ABI

The plugin needs a non-empty JSON ABI from `cargo stylus export-abi` to deploy. These crates only export errors (no functions) or an empty interface:

| Crate                | `export-abi` output                 |
| -------------------- | ----------------------------------- |
| `beacon-proxy`       | has functions but reverts on deploy |
| `upgradeable-beacon` | errors only                         |
| `ownable-two-step`   | errors only                         |
| `erc20-wrapper`      | errors only                         |
| `vesting-wallet`     | errors only                         |
| `safe-erc20`         | empty interface                     |
| `erc4626`            | empty interface                     |
| `erc721-wrapper`     | empty interface                     |
| `erc721-holder`      | empty interface                     |
| `erc1155-holder`     | empty interface                     |

### Reason: WASM too large for single-fragment deploy on test node

| Crate             | Compressed size  | Issue                              |
| ----------------- | ---------------- | ---------------------------------- |
| `erc721-metadata` | ~25 KB (2 frags) | Exceeds 24KB single-fragment limit |

### Reason: Upstream toolchain incompatibility

| Crate              | Issue                                                        |
| ------------------ | ------------------------------------------------------------ |
| `erc20-flash-mint` | `branches` crate v0.3.0 incompatible with nightly-2025-08-01 |

To cover these, you'd need to either fix upstream issues, use a different toolchain version, or ensure `arb:compile` generates full artifacts with multi-fragment support.
