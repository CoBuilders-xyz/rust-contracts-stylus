import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { STYLUS_LOCAL_CHAIN_ID } from './test-helpers.js';

describe('openzeppelin / erc721-metadata-example', async function () {
  const { stylusViem } = await network.create();
  const [wallet] = await stylusViem.getWalletClients();
  const publicClient = await stylusViem.getPublicClient();

  const contract = await stylusViem.deployContract('erc721-metadata-example', [
    'OZ721Metadata',
    'OZ721MD',
    'https://example.org/',
  ]);

  it('deploys', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);
  });

  it('mints then updates token URI on the live node', async function () {
    const h1 = await contract.write.mint([wallet.account.address, 1n]);
    await publicClient.waitForTransactionReceipt({ hash: h1 });

    const h2 = await contract.write.setTokenURI([
      1n,
      'https://example.org/token/1.json',
    ]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: h2 });
    assert.equal(receipt.status, 'success');
  });
});
