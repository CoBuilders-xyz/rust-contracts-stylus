import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { STYLUS_LOCAL_CHAIN_ID } from './test-helpers.js';

const CONTRACT = 'erc1155-supply-example';

describe(`openzeppelin / ${CONTRACT}`, async function () {
  const { stylusViem } = await network.create();
  const [wallet] = await stylusViem.getWalletClients();
  const publicClient = await stylusViem.getPublicClient();

  const contract = await stylusViem.deployContract(CONTRACT, []);

  it('deploys', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);
  });

  it('mints with supply tracking', async function () {
    const hash = await contract.write.mint([
      wallet.account.address,
      1n,
      50n,
      '0x',
    ]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    assert.equal(receipt.status, 'success');
  });

  it('mintBatch with supply tracking', async function () {
    const hash = await contract.write.mintBatch([
      wallet.account.address,
      [10n, 11n, 12n],
      [100n, 200n, 300n],
      '0x',
    ]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    assert.equal(receipt.status, 'success');
  });

  it('mintBatch reverts on array length mismatch', async function () {
    await assert.rejects(() =>
      contract.write.mintBatch([
        wallet.account.address,
        [1n, 2n, 3n],
        [10n, 20n],
        '0x',
      ]),
    );
  });
});
