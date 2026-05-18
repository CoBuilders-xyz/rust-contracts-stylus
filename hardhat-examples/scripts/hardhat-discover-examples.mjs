/**
 * Example crates live under hardhat-examples/contracts (symlink → ../examples).
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

export function parsePackageName(cargoTomlPath) {
  const raw = readFileSync(cargoTomlPath, 'utf8');
  const m = raw.match(/^name = "([^"]+)"/m);
  return m?.[1];
}

export function isStylusExampleDir(dir) {
  const cargo = path.join(dir, 'Cargo.toml');
  const lib = path.join(dir, 'src', 'lib.rs');
  if (!existsSync(cargo) || !existsSync(lib)) return false;
  return readFileSync(cargo, 'utf8').includes('stylus-sdk');
}

export function walkExampleDirs(rootDir, out = []) {
  if (!existsSync(rootDir)) return out;
  for (const name of readdirSync(rootDir)) {
    if (name === 'target') continue;
    const full = path.join(rootDir, name);
    if (!statSync(full).isDirectory()) continue;
    if (isStylusExampleDir(full)) out.push(full);
    walkExampleDirs(full, out);
  }
  return out;
}

export function discoverExamples(examplesRoot) {
  return walkExampleDirs(examplesRoot).map((dir) => ({
    dir,
    packageName: parsePackageName(path.join(dir, 'Cargo.toml')),
  }));
}
