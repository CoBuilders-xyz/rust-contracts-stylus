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

  it('constructor grants DEFAULT_ADMIN_ROLE to deployer', async function () {
    const members = await contract.read.getRoleMembers([DEFAULT_ADMIN_ROLE]);
    assert.equal(members.length, 1);
    assert.equal(members[0].toLowerCase(), admin.account.address.toLowerCase());
  });

  it('makeAdmin grants TRANSFER_ROLE', async function () {
    const hash = await contract.write.makeAdmin([other.account.address]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    assert.equal(receipt.status, 'success');

    const members = await contract.read.getRoleMembers([transferRole()]);
    assert.ok(
      members.some(
        (a: string) => a.toLowerCase() === other.account.address.toLowerCase(),
      ),
    );
  });

  it('granting same role twice is idempotent (no duplicate members)', async function () {
    await contract.write.makeAdmin([other.account.address]);
    const members = await contract.read.getRoleMembers([transferRole()]);
    const unique = new Set(members.map((a: string) => a.toLowerCase()));
    assert.equal(unique.size, members.length);
  });

  it('non-admin cannot call makeAdmin (reverts)', async function () {
    await assert.rejects(() =>
      other.writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'makeAdmin',
        args: [admin.account.address],
      }),
    );
  });

  it('setRoleAdmin changes the admin role for TRANSFER_ROLE', async function () {
    const newAdminRole =
      '0x879ce0d4bfd332649ca3552efe772a38d64a315eb70ab69689fd309c735946b5' as const;
    const hash = await contract.write.setRoleAdmin([
      transferRole(),
      newAdminRole,
    ]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    assert.equal(receipt.status, 'success');
  });
});
