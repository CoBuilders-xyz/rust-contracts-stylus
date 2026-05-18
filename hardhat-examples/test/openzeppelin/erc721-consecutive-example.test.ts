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

  it('deploys', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);
  });

  it('extra mint uses a token id above the consecutive window', async function () {
    const tokenId = 10_000n;
    const hash = await contract.write.mint([wallet.account.address, tokenId]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    assert.equal(receipt.status, 'success');
  });
});
