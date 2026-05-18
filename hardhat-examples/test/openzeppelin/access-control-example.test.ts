import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import {
  DEFAULT_ADMIN_ROLE,
  STYLUS_LOCAL_CHAIN_ID,
  transferRole,
} from './test-helpers.js';

const CONTRACT = 'access-control-example';

describe(`openzeppelin / ${CONTRACT}`, async function () {
  const { stylusViem } = await network.create();
  const [admin, other] = await stylusViem.getWalletClients();
  const publicClient = await stylusViem.getPublicClient();

  const contract = await stylusViem.deployContract(CONTRACT, [
    admin.account.address,
  ]);

  it('deploys on the stylus test node', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);
  });

  it('enumerates default admin and can grant TRANSFER_ROLE via makeAdmin', async function () {
    const admins = await contract.read.getRoleMembers([DEFAULT_ADMIN_ROLE]);
    assert.equal(admins.length, 1);
    assert.equal(admins[0].toLowerCase(), admin.account.address.toLowerCase());

    await contract.write.makeAdmin([other.account.address]);
    const transferHolders = await contract.read.getRoleMembers([
      transferRole(),
    ]);
    assert.ok(
      transferHolders.some(
        (a) => a.toLowerCase() === other.account.address.toLowerCase(),
      ),
    );
  });
});
