#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'test', 'openzeppelin');

const files = readdirSync(dir)
  .filter((f) => f.endsWith('.test.ts'))
  .sort();

for (const f of files) {
  const rel = path.join('test/openzeppelin', f);
  execSync(`npx hardhat test ${rel}`, { cwd: root, stdio: 'inherit' });
}
