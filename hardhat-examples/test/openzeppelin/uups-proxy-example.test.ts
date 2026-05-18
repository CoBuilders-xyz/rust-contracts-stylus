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

  it('getVersion is readable after deploy', async function () {
    const version = await contract.read.getVersion();
    assert.equal(typeof version, 'number');
  });

  it('mint succeeds (ERC20 logic behind UUPS proxy)', async function () {
    const hash = await contract.write.mint([wallet.account.address, 100n]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    assert.equal(receipt.status, 'success');
  });

  it('mint multiple times accumulates', async function () {
    const h1 = await contract.write.mint([wallet.account.address, 50n]);
    const h2 = await contract.write.mint([wallet.account.address, 75n]);
    const [r1, r2] = await Promise.all([
      publicClient.waitForTransactionReceipt({ hash: h1 }),
      publicClient.waitForTransactionReceipt({ hash: h2 }),
    ]);
    assert.equal(r1.status, 'success');
    assert.equal(r2.status, 'success');
  });
});
