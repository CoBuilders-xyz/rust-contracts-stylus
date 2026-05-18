import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { STYLUS_LOCAL_CHAIN_ID } from './test-helpers.js';

const CONTRACT = 'pedersen-example';

describe(`openzeppelin / ${CONTRACT}`, async function () {
  const { stylusViem } = await network.create();
  const publicClient = await stylusViem.getPublicClient();

  const contract = await stylusViem.deployContract(CONTRACT, []);

  it('deploys', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);
  });

  it('hash(uint256[2]) view returns deterministic value', async function () {
    const a = 123456789n;
    const b = 987654321n;
    const h1 = await contract.read.hash([[a, b]]);
    const h2 = await contract.read.hash([[a, b]]);
    assert.equal(h1, h2);
    assert.notEqual(h1, 0n);
  });
});
