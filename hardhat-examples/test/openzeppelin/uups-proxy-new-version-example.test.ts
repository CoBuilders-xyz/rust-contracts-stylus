import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { STYLUS_LOCAL_CHAIN_ID } from './test-helpers.js';

describe('openzeppelin / uups-proxy-new-version-example', async function () {
  const { stylusViem } = await network.create();
  const [wallet] = await stylusViem.getWalletClients();
  const publicClient = await stylusViem.getPublicClient();

  const contract = await stylusViem.deployContract(
    'uups-proxy-new-version-example',
    [wallet.account.address],
  );

  it('deploys on stylus', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);
  });

  it('mint on upgraded example; getVersion is readable', async function () {
    await contract.read.getVersion();

    const r = await publicClient.waitForTransactionReceipt({
      hash: await contract.write.mint([wallet.account.address, 5n]),
    });
    assert.equal(r.status, 'success');
  });
});
