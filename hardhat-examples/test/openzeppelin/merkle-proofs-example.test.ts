import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { MERKLE_TRIVIAL_ROOT, STYLUS_LOCAL_CHAIN_ID } from './test-helpers.js';

const CONTRACT = 'merkle-proofs-example';

describe(`openzeppelin / ${CONTRACT}`, async function () {
  const { stylusViem } = await network.create();
  const publicClient = await stylusViem.getPublicClient();

  const contract = await stylusViem.deployContract(CONTRACT, []);

  it('deploys', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);
  });

  it('verify: empty proof accepts when leaf equals root; rejects otherwise', async function () {
    assert.equal(
      await contract.read.verify([
        [],
        MERKLE_TRIVIAL_ROOT,
        MERKLE_TRIVIAL_ROOT,
      ]),
      true,
    );

    const wrongLeaf =
      '0x0202020202020202020202020202020202020202020202020202020202020202' as const;
    assert.equal(
      await contract.read.verify([[], MERKLE_TRIVIAL_ROOT, wrongLeaf]),
      false,
    );
  });
});
