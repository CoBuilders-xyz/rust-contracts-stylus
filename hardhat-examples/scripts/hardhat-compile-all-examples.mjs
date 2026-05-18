#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { discoverExamples } from './hardhat-discover-examples.mjs';

const hardhatRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contractsDir = path.resolve(hardhatRoot, 'contracts');

if (!existsSync(contractsDir)) {
  console.error(
    'Missing hardhat-examples/contracts/. Run npm install in hardhat-examples/.',
  );
  process.exit(1);
}

const names = discoverExamples(contractsDir)
  .map((p) => p.packageName)
  .filter(Boolean);

if (names.length === 0) {
  console.error('No Stylus examples found under contracts/.');
  process.exit(1);
}

execSync(
  `npx hardhat arb:compile --stylus --host --contracts ${names.join(',')}`,
  {
    cwd: hardhatRoot,
    stdio: 'inherit',
  },
);
