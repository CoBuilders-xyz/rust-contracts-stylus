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

  it('deploys on the stylus test node', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);
  });

  it('mints tokens to an account', async function () {
    const hash = await contract.write.mint([wallet.account.address, 1000n]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    assert.equal(receipt.status, 'success');
  });

  it('mints multiple times (cumulative)', async function () {
    const h1 = await contract.write.mint([wallet.account.address, 500n]);
    const h2 = await contract.write.mint([wallet.account.address, 500n]);
    const [r1, r2] = await Promise.all([
      publicClient.waitForTransactionReceipt({ hash: h1 }),
      publicClient.waitForTransactionReceipt({ hash: h2 }),
    ]);
    assert.equal(r1.status, 'success');
    assert.equal(r2.status, 'success');
  });
});
