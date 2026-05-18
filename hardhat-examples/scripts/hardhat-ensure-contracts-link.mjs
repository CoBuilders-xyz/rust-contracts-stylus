#!/usr/bin/env node
/**
 * Copies ../examples into hardhat-examples/contracts so Hardhat can mutate a local snapshot.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const hardhatRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const examples = path.resolve(hardhatRoot, '..', 'examples');
const contracts = path.join(hardhatRoot, 'contracts');
const marker = path.join(contracts, '.hardhat-examples-copy');

if (!fs.existsSync(examples)) {
  process.exit(0);
}

try {
  const st = fs.lstatSync(contracts);
  if (st.isSymbolicLink()) {
    fs.unlinkSync(contracts);
  } else if (st.isDirectory()) {
    if (!fs.existsSync(marker)) {
      console.warn(
        'hardhat-examples: contracts/ exists as a folder without a generated-copy marker; remove it manually if you want to replace it',
      );
      process.exit(0);
    }
    fs.rmSync(contracts, { recursive: true, force: true });
  } else {
    fs.rmSync(contracts, { force: true });
  }
} catch {
  /* missing */
}

try {
  fs.cpSync(examples, contracts, {
    recursive: true,
    filter: (src) => {
      const base = path.basename(src);
      return !['.cargo', 'target', 'Stylus.toml', 'rust-toolchain.toml'].includes(base);
    },
  });
  fs.writeFileSync(
    marker,
    'Generated copy of ../examples for hardhat-examples. Safe to delete.\n',
  );
} catch (e) {
  console.warn(`hardhat-examples: could not copy contracts: ${e.message}`);
}
