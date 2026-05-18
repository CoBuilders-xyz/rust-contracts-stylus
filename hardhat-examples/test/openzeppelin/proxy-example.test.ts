import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { STYLUS_LOCAL_CHAIN_ID } from './test-helpers.js';

/** Stored implementation from deploy (not necessarily executable code). */
const DUMMY_IMPL = '0x0000000000000000000000000000000000000001' as const;

describe('openzeppelin / proxy-example', async function () {
  const { stylusViem } = await network.create();
  const publicClient = await stylusViem.getPublicClient();

  const contract = await stylusViem.deployContract('proxy-example', [
    DUMMY_IMPL,
  ]);

  it('deploys', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);
  });

  it('implementation() matches constructor argument', async function () {
    const impl = await contract.read.implementation();
    assert.equal(impl.toLowerCase(), DUMMY_IMPL.toLowerCase());
  });
});
