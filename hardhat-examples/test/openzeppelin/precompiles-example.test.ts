import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { STYLUS_LOCAL_CHAIN_ID } from './test-helpers.js';

const CONTRACT = 'precompiles-example';

describe(`openzeppelin / ${CONTRACT}`, async function () {
  const { stylusViem } = await network.create();
  const publicClient = await stylusViem.getPublicClient();

  const contract = await stylusViem.deployContract(CONTRACT, []);

  it('deploys', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);
  });

  it('p256VerifyExample view runs on the node (invalid sig expected false)', async function () {
    const hash =
      '0x0000000000000000000000000000000000000000000000000000000000000000' as const;
    const ok = await contract.read.p256VerifyExample([
      hash,
      hash,
      hash,
      hash,
      hash,
    ]);
    assert.equal(ok, false);
  });
});
