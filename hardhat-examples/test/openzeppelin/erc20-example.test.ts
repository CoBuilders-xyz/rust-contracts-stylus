import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { STYLUS_LOCAL_CHAIN_ID } from './test-helpers.js';

const CAP = 1_000_000n;

describe('openzeppelin / erc20-example', async function () {
  const { stylusViem } = await network.create();
  const [wallet] = await stylusViem.getWalletClients();
  const publicClient = await stylusViem.getPublicClient();

  const contract = await stylusViem.deployContract('erc20-example', [
    'TestToken',
    'TTK',
    CAP,
  ]);

  it('deploys on stylus chain', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);
  });

  it('mints, then admin can pause / unpause', async function () {
    const mintHash = await contract.write.mint([wallet.account.address, 100n]);
    await publicClient.waitForTransactionReceipt({ hash: mintHash });

    const pauseHash = await contract.write.pause();
    await publicClient.waitForTransactionReceipt({ hash: pauseHash });

    const unpauseHash = await contract.write.unpause();
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: unpauseHash,
    });
    assert.equal(receipt.status, 'success');
  });
});
