#!/usr/bin/env node
/**
 * Copies cargo-stylus metadata into each example and symlinks WASM from the workspace
 * target (workspace build outputs to repo-root/target/).
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  realpathSync,
  symlinkSync,
  unlinkSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { discoverExamples } from './hardhat-discover-examples.mjs';

const hardhatRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contractsDir = path.resolve(hardhatRoot, 'contracts');
const supportDir = path.resolve(hardhatRoot, 'hardhat-stylus');

if (!existsSync(contractsDir)) {
  console.error(
    'Missing hardhat-examples/contracts/. Run npm install here (postinstall links ../examples).',
  );
  process.exit(1);
}

const examplesReal = realpathSync(contractsDir);
const workspaceRoot = path.resolve(examplesReal, '..');

/** Cargo workspace root: cargo-stylus resolves here and expects Stylus.toml (members alone are not enough). */
cpSync(path.join(supportDir, 'Stylus.toml'), path.join(workspaceRoot, 'Stylus.toml'));

const pairs = discoverExamples(examplesReal).filter((p) => p.packageName);

for (const { dir, packageName } of pairs) {
  cpSync(path.join(supportDir, 'Stylus.toml'), path.join(dir, 'Stylus.toml'));
  cpSync(
    path.join(supportDir, 'rust-toolchain.toml'),
    path.join(dir, 'rust-toolchain.toml'),
  );
  mkdirSync(path.join(dir, '.cargo'), { recursive: true });
  cpSync(
    path.join(supportDir, '.cargo', 'config.toml'),
    path.join(dir, '.cargo', 'config.toml'),
  );

  const wasmFile = `${packageName.replace(/-/g, '_')}.wasm`;
  const dest = path.join(
    dir,
    'target/wasm32-unknown-unknown/release',
    wasmFile,
  );
  const src = path.join(
    workspaceRoot,
    'target/wasm32-unknown-unknown/release',
    wasmFile,
  );
  mkdirSync(path.dirname(dest), { recursive: true });
  try {
    unlinkSync(dest);
  } catch {
    /* noop */
  }
  try {
    symlinkSync(src, dest);
  } catch (e) {
    console.warn(`Symlink skip ${packageName}: ${e.message}`);
  }
}

console.log(`Hardhat: prepared ${pairs.length} examples`);
