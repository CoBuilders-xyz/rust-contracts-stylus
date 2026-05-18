import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { STYLUS_LOCAL_CHAIN_ID } from './test-helpers.js';

const CONTRACT = 'precompiles-example';
const ZERO_HASH =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as const;

describe(`openzeppelin / ${CONTRACT}`, async function () {
  const { stylusViem } = await network.create();
  const publicClient = await stylusViem.getPublicClient();

  const contract = await stylusViem.deployContract(CONTRACT, []);

  it('deploys', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);
  });

  it('p256VerifyExample: invalid signature returns false', async function () {
    const result = await contract.read.p256VerifyExample([
      ZERO_HASH,
      ZERO_HASH,
      ZERO_HASH,
      ZERO_HASH,
      ZERO_HASH,
    ]);
    assert.equal(result, false);
  });

  it('p256VerifyExample: deterministic for same inputs', async function () {
    const hash =
      '0x1111111111111111111111111111111111111111111111111111111111111111' as const;
    const r1 = await contract.read.p256VerifyExample([
      hash,
      hash,
      hash,
      hash,
      hash,
    ]);
    const r2 = await contract.read.p256VerifyExample([
      hash,
      hash,
      hash,
      hash,
      hash,
    ]);
    assert.equal(r1, r2);
  });
});
