import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { STYLUS_LOCAL_CHAIN_ID } from './test-helpers.js';

describe('openzeppelin / erc721-consecutive-example', async function () {
  const { stylusViem } = await network.create();
  const [wallet] = await stylusViem.getWalletClients();
  const publicClient = await stylusViem.getPublicClient();

  const contract = await stylusViem.deployContract(
    'erc721-consecutive-example',
    ['[]', '[]', 1n, 100n],
  );

  it('deploys with consecutive mint constructor', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);
  });

  it('mints a token above the consecutive window', async function () {
    const tokenId = 10_000n;
    const hash = await contract.write.mint([wallet.account.address, tokenId]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    assert.equal(receipt.status, 'success');
  });

  it('minting same token id twice reverts', async function () {
    const tokenId = 20_000n;
    await contract.write.mint([wallet.account.address, tokenId]);
    await assert.rejects(() =>
      contract.write.mint([wallet.account.address, tokenId]),
    );
  });

  it('mints multiple distinct tokens', async function () {
    for (const id of [30_000n, 30_001n, 30_002n]) {
      const hash = await contract.write.mint([wallet.account.address, id]);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      assert.equal(receipt.status, 'success');
    }
  });
});
