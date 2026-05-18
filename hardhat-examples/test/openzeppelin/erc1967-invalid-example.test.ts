import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';

describe('openzeppelin / erc1967-invalid-example', async function () {
  it('deploy fails (invalid ERC-1967 storage layout)', async function () {
    const { stylusViem } = await network.create();
    const impl = await stylusViem.deployContract('erc1155-example', []);

    await assert.rejects(() =>
      stylusViem.deployContract('erc1967-invalid-example', [
        impl.address,
        '0x',
      ]),
    );
  });
});
