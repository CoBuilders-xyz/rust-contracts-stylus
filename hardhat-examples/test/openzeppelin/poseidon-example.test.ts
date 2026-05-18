import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { STYLUS_LOCAL_CHAIN_ID } from './test-helpers.js';

const CONTRACT = 'poseidon-example';

describe(`openzeppelin / ${CONTRACT}`, async function () {
  const { stylusViem } = await network.create();
  const publicClient = await stylusViem.getPublicClient();

  const contract = await stylusViem.deployContract(CONTRACT, []);

  it('deploys', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);
  });

  it('Poseidon2 hash is deterministic', async function () {
    const h1 = await contract.read.hash([[3n, 9n]]);
    const h2 = await contract.read.hash([[3n, 9n]]);
    assert.equal(h1, h2);
    assert.notEqual(h1, 0n);
  });

  it('different inputs produce different hashes', async function () {
    const h1 = await contract.read.hash([[1n, 2n]]);
    const h2 = await contract.read.hash([[5n, 6n]]);
    assert.notEqual(h1, h2);
  });

  it('hash(0, 0) returns a non-zero result', async function () {
    const h = await contract.read.hash([[0n, 0n]]);
    assert.notEqual(h, 0n);
  });
});
