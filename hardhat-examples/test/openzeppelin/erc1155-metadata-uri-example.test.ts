import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { STYLUS_LOCAL_CHAIN_ID } from './test-helpers.js';

describe('openzeppelin / erc1155-metadata-uri-example', async function () {
  const { stylusViem } = await network.create();
  const publicClient = await stylusViem.getPublicClient();

  const contract = await stylusViem.deployContract(
    'erc1155-metadata-uri-example',
    ['https://example.org/{id}.json'],
  );

  it('deploys', async function () {
    assert.ok(contract.address);
    assert.equal(await publicClient.getChainId(), STYLUS_LOCAL_CHAIN_ID);
  });

  it('updates per-token URI and base URI (state on test node)', async function () {
    let hash = await contract.write.setTokenURI([
      1n,
      'https://meta.example/1.json',
    ]);
    let r = await publicClient.waitForTransactionReceipt({ hash });
    assert.equal(r.status, 'success');

    hash = await contract.write.setBaseURI(['https://cdn.example/']);
    r = await publicClient.waitForTransactionReceipt({ hash });
    assert.equal(r.status, 'success');
  });
});
