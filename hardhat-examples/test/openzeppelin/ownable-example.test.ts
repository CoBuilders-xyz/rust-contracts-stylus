import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { STYLUS_LOCAL_CHAIN_ID } from './test-helpers.js';

const CONTRACT = 'ownable-example';

describe(`openzeppelin / ${CONTRACT}`, async function () {
  const { stylusViem } = await network.create();
  const [wallet] = await stylusViem.getWalletClients();
  const publicClient = await stylusViem.getPublicClient();

  const contract = await stylusViem.deployContract(CONTRACT, [
    wallet.account.address,
  ]);

  it('deploys; export-abi exposes proxiableUUID dummy as zero', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);

    const uuid = await contract.read.proxiableUUID();
    assert.equal(
      uuid,
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    );
  });
});
