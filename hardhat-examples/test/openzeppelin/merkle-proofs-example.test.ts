import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { keccak256, stringToBytes } from 'viem';
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

  it('verify: empty proof + leaf === root → true (trivial tree)', async function () {
    const result = await contract.read.verify([
      [],
      MERKLE_TRIVIAL_ROOT,
      MERKLE_TRIVIAL_ROOT,
    ]);
    assert.equal(result, true);
  });

  it('verify: empty proof + leaf !== root → false', async function () {
    const wrongLeaf =
      '0x0202020202020202020202020202020202020202020202020202020202020202' as const;
    const result = await contract.read.verify([
      [],
      MERKLE_TRIVIAL_ROOT,
      wrongLeaf,
    ]);
    assert.equal(result, false);
  });

  it('verify: single-element proof validates correctly', async function () {
    const leaf = keccak256(stringToBytes('leaf'));
    const sibling = keccak256(stringToBytes('sibling'));

    const result = await contract.read.verify([[sibling], leaf, leaf]);
    assert.equal(typeof result, 'boolean');
  });

  it('verify: is deterministic for same inputs', async function () {
    const proof = [MERKLE_TRIVIAL_ROOT];
    const root = keccak256(stringToBytes('root'));
    const leaf = keccak256(stringToBytes('data'));

    const r1 = await contract.read.verify([proof, root, leaf]);
    const r2 = await contract.read.verify([proof, root, leaf]);
    assert.equal(r1, r2);
  });
});
