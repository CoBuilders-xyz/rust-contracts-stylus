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

  it('mints a token', async function () {
    const hash = await contract.write.mint([wallet.account.address, 1n]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    assert.equal(receipt.status, 'success');
  });

  it('safeMint with empty data', async function () {
    const hash = await contract.write.safeMint([
      wallet.account.address,
      2n,
      '0x',
    ]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    assert.equal(receipt.status, 'success');
  });

  it('safeMint with non-empty data', async function () {
    const hash = await contract.write.safeMint([
      wallet.account.address,
      3n,
      '0xdeadbeef',
    ]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    assert.equal(receipt.status, 'success');
  });

  it('minting same token id twice reverts', async function () {
    await contract.write.mint([wallet.account.address, 100n]);
    await assert.rejects(() =>
      contract.write.mint([wallet.account.address, 100n]),
    );
  });
});
