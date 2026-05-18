import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { STYLUS_LOCAL_CHAIN_ID } from './test-helpers.js';

const CONTRACT = 'erc20-flash-mint-example';

describe(`openzeppelin / ${CONTRACT}`, async function () {
  const { stylusViem } = await network.create();
  const [wallet] = await stylusViem.getWalletClients();
  const publicClient = await stylusViem.getPublicClient();

  const contract = await stylusViem.deployContract(CONTRACT, []);

  it('deploys', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);
  });

  it('configures flash fee receiver/value then mints', async function () {
    await publicClient.waitForTransactionReceipt({
      hash: await contract.write.setFlashFeeReceiver([wallet.account.address]),
    });
    await publicClient.waitForTransactionReceipt({
      hash: await contract.write.setFlashFeeValue([1n]),
    });

    const r = await publicClient.waitForTransactionReceipt({
      hash: await contract.write.mint([wallet.account.address, 50n]),
    });
    assert.equal(r.status, 'success');
  });
});
