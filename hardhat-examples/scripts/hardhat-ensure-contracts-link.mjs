#!/usr/bin/env node
/**
 * Creates hardhat-examples/contracts → ../examples (repo `contracts/` is the library, not examples).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const hardhatRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const examples = path.resolve(hardhatRoot, '..', 'examples');
const contracts = path.join(hardhatRoot, 'contracts');

if (!fs.existsSync(examples)) {
  process.exit(0);
}

try {
  const st = fs.lstatSync(contracts);
  if (st.isSymbolicLink()) {
    if (fs.realpathSync(contracts) === fs.realpathSync(examples)) {
      process.exit(0);
    }
    fs.unlinkSync(contracts);
  } else if (st.isDirectory()) {
    console.warn(
      'hardhat-examples: contracts/ exists as a folder; remove it so postinstall can link to ../examples',
    );
    process.exit(0);
  }
} catch {
  /* missing */
}

try {
  fs.symlinkSync(
    path.relative(path.dirname(contracts), examples),
    contracts,
  );
} catch (e) {
  console.warn(`hardhat-examples: could not create contracts link: ${e.message}`);
}
