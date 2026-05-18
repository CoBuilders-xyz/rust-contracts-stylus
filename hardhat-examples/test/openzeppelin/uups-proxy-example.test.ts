import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { STYLUS_LOCAL_CHAIN_ID } from './test-helpers.js';

describe('openzeppelin / uups-proxy-example', async function () {
  const { stylusViem } = await network.create();
  const [wallet] = await stylusViem.getWalletClients();
  const publicClient = await stylusViem.getPublicClient();

  const contract = await stylusViem.deployContract('uups-proxy-example', [
    wallet.account.address,
  ]);

  it('deploys on stylus', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);
  });

  it('mint succeeds (UUPS + ERC20 logic on nitro; getVersion readable)', async function () {
    await contract.read.getVersion();

    const mintHash = await contract.write.mint([wallet.account.address, 7n]);
    const mintRc = await publicClient.waitForTransactionReceipt({
      hash: mintHash,
    });
    assert.equal(mintRc.status, 'success');
  });
});
