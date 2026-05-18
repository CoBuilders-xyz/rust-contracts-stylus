import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { STYLUS_LOCAL_CHAIN_ID } from './test-helpers.js';

describe('openzeppelin / erc1967-example', async function () {
  const { stylusViem } = await network.create();
  const publicClient = await stylusViem.getPublicClient();

  const impl = await stylusViem.deployContract('erc1155-example', []);

  const contract = await stylusViem.deployContract('erc1967-example', [
    impl.address,
    '0x',
  ]);

  it('deploys and reports the implementation we passed in', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);

    const stored = await contract.read.implementation();
    assert.equal(stored.toLowerCase(), impl.address.toLowerCase());
  });
});
