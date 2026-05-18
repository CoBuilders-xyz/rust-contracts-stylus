import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { STYLUS_LOCAL_CHAIN_ID } from './test-helpers.js';

const CONTRACT = 'eddsa-example';

describe(`openzeppelin / ${CONTRACT}`, async function () {
  const { stylusViem } = await network.create();
  const publicClient = await stylusViem.getPublicClient();

  const contract = await stylusViem.deployContract(CONTRACT, []);

  it('deploys', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);
  });

  it('verify returns a boolean', async function () {
    const result = await contract.read.verify([[0n, 0n], [0n, 0n, 0n], '0x']);
    assert.equal(typeof result, 'boolean');
  });

  it('verify is deterministic for same inputs', async function () {
    const args: [[bigint, bigint], [bigint, bigint, bigint], `0x${string}`] = [
      [1n, 2n],
      [3n, 4n, 5n],
      '0xdeadbeef',
    ];
    const r1 = await contract.read.verify(args);
    const r2 = await contract.read.verify(args);
    assert.equal(r1, r2);
  });
});
