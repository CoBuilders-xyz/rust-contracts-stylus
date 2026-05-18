import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { STYLUS_LOCAL_CHAIN_ID } from './test-helpers.js';

const CONTRACT = 'erc721-example';

describe(`openzeppelin / ${CONTRACT}`, async function () {
  const { stylusViem } = await network.create();
  const [wallet] = await stylusViem.getWalletClients();
  const publicClient = await stylusViem.getPublicClient();

  const contract = await stylusViem.deployContract(CONTRACT, []);

  it('deploys on stylus', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);
  });

  it('mints token id 1 and can safeMint with empty data', async function () {
    const h1 = await contract.write.mint([wallet.account.address, 1n]);
    let r = await publicClient.waitForTransactionReceipt({ hash: h1 });
    assert.equal(r.status, 'success');

    const h2 = await contract.write.safeMint([
      wallet.account.address,
      2n,
      '0x',
    ]);
    r = await publicClient.waitForTransactionReceipt({ hash: h2 });
    assert.equal(r.status, 'success');
  });
});
