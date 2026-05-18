import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { STYLUS_LOCAL_CHAIN_ID } from './test-helpers.js';

const CONTRACT = 'basic-example';

describe(`openzeppelin / ${CONTRACT}`, async function () {
  const { stylusViem } = await network.create();
  const [wallet] = await stylusViem.getWalletClients();
  const publicClient = await stylusViem.getPublicClient();

  const contract = await stylusViem.deployContract(CONTRACT, [
    'OZBasic',
    'OZB',
  ]);

  it('deploys and mints on-chain (export-abi exposes mint)', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);

    const hash = await contract.write.mint([wallet.account.address, 42n]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    assert.equal(receipt.status, 'success');
  });
});
