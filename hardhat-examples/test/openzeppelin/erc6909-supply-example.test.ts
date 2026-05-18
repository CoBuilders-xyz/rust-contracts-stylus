import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { STYLUS_LOCAL_CHAIN_ID } from './test-helpers.js';

const CONTRACT = 'erc6909-supply-example';

describe(`openzeppelin / ${CONTRACT}`, async function () {
  const { stylusViem } = await network.create();
  const [wallet] = await stylusViem.getWalletClients();
  const publicClient = await stylusViem.getPublicClient();

  const contract = await stylusViem.deployContract(CONTRACT, []);

  it('deploys', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);
  });

  it('mint and burn on tracked supply', async function () {
    const id = 8n;
    await publicClient.waitForTransactionReceipt({
      hash: await contract.write.mint([wallet.account.address, id, 1000n]),
    });
    const r = await publicClient.waitForTransactionReceipt({
      hash: await contract.write.burn([wallet.account.address, id, 1n]),
    });
    assert.equal(r.status, 'success');
  });
});
