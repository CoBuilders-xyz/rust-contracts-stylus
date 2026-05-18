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

  it('mints tokens', async function () {
    const hash = await contract.write.mint([wallet.account.address, 100n]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    assert.equal(receipt.status, 'success');
  });

  it('pause blocks further mints', async function () {
    const pauseHash = await contract.write.pause();
    const pauseRc = await publicClient.waitForTransactionReceipt({
      hash: pauseHash,
    });
    assert.equal(pauseRc.status, 'success');

    await assert.rejects(() =>
      contract.write.mint([wallet.account.address, 1n]),
    );
  });

  it('unpause re-enables mints', async function () {
    const unpauseHash = await contract.write.unpause();
    const unpauseRc = await publicClient.waitForTransactionReceipt({
      hash: unpauseHash,
    });
    assert.equal(unpauseRc.status, 'success');

    const mintHash = await contract.write.mint([wallet.account.address, 50n]);
    const mintRc = await publicClient.waitForTransactionReceipt({
      hash: mintHash,
    });
    assert.equal(mintRc.status, 'success');
  });

  it('double pause reverts', async function () {
    await contract.write.pause();
    await assert.rejects(() => contract.write.pause());
    await contract.write.unpause();
  });

  it('unpause when not paused reverts', async function () {
    await assert.rejects(() => contract.write.unpause());
  });
});
