import { keccak256, stringToBytes } from 'viem';

/** OpenZeppelin AccessControl: `DEFAULT_ADMIN_ROLE` is `bytes32(0)`. */
export const DEFAULT_ADMIN_ROLE =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as const;

/** Matches `keccak256("TRANSFER_ROLE")` in the Stylus access-control example. */
export function transferRole(): `0x${string}` {
  return keccak256(stringToBytes('TRANSFER_ROLE'));
}

/** Must match `stylus.node.chainId` in `hardhat.config.ts`. */
export const STYLUS_LOCAL_CHAIN_ID = 412346;

/** Trivial Merkle root: empty proof + leaf === root is valid. */
export const MERKLE_TRIVIAL_ROOT =
  '0x0101010101010101010101010101010101010101010101010101010101010101' as const;
