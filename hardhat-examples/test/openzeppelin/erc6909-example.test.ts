import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { STYLUS_LOCAL_CHAIN_ID } from './test-helpers.js';

const CONTRACT = 'erc6909-example';

describe(`openzeppelin / ${CONTRACT}`, async function () {
  const { stylusViem } = await network.create();
  const [wallet] = await stylusViem.getWalletClients();
  const publicClient = await stylusViem.getPublicClient();

  const contract = await stylusViem.deployContract(CONTRACT, []);

  it('deploys', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);
  });

  it('mints tokens for a given id', async function () {
    const hash = await contract.write.mint([wallet.account.address, 1n, 500n]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    assert.equal(receipt.status, 'success');
  });

  it('burns tokens from own balance', async function () {
    await contract.write.mint([wallet.account.address, 2n, 200n]);
    const hash = await contract.write.burn([wallet.account.address, 2n, 50n]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    assert.equal(receipt.status, 'success');
  });

  it('burn reverts on insufficient balance', async function () {
    await contract.write.mint([wallet.account.address, 3n, 10n]);
    await assert.rejects(() =>
      contract.write.burn([wallet.account.address, 3n, 999n]),
    );
  });

  it('burn reverts for zero address sender', async function () {
    await assert.rejects(() =>
      contract.write.burn([
        '0x0000000000000000000000000000000000000000',
        1n,
        1n,
      ]),
    );
  });
});
