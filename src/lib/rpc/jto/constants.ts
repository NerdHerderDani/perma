/**
 * Every address here ships only with live transaction evidence behind it,
 * documented with verification dates in DECODING.md. No evidence, no address.
 */

/** JTO governance token mint. Verified live 2026-08-24: getTokenSupply +
 * getAccountInfo (mintAuthority null, freezeAuthority null). DECODING.md §1. */
export const JTO_MINT = "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL";
export const JTO_DECIMALS = 9;

/** 1,000,000,000 JTO in raw base units. Provenance: DECODING.md §2 — Jito
 * docs state 1B genesis supply; mint authority is null (verified on-chain),
 * so supply is burn-only monotone decreasing from the verification date. */
export const GENESIS_SUPPLY_RAW = "1000000000000000000";

export interface VerifiedAddress {
  address: string;
  role: string;
  verifiedOn: string; // ISO date the live-transaction evidence was captured
  evidenceTx: string; // one representative transaction signature
}

/**
 * Layer 2 — JIP-38 attribution. null means attribution is NOT verified and
 * every Layer-2 figure renders "unverified". Filling this in requires live
 * transaction evidence recorded in DECODING.md first.
 */
export const REV_SPLITTER: VerifiedAddress | null = null;

/** Bounded scan window (free-tier RPC constraint, see DECODING.md §5). */
export const SCAN_MAX_SIGNATURES = 1000;

export const explorerTx = (sig: string) => `https://solscan.io/tx/${sig}`;
export const explorerAccount = (addr: string) => `https://solscan.io/account/${addr}`;
