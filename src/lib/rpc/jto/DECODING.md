# DECODING.md — Step 0 research trail

Every address and constant this app ships is recorded here with the live chain
evidence behind it and the date it was captured. No evidence, no address — an
unverifiable actor renders UNVERIFIED in the UI instead of shipping.

## §1 JTO mint — VERIFIED 2026-08-24

- Mint: `jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL`
- `getTokenSupply` (mainnet, slot 441,548,431 and again slot 441,548,655 on an
  independent endpoint): `986522966411456067` raw = **986,522,966.411456067 JTO**,
  decimals 9. Two RPC providers agreed byte-for-byte.
- `getAccountInfo` jsonParsed (slot 441,548,775): `mintAuthority: null`,
  `freezeAuthority: null`, owner `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`
  (SPL Token). **Supply can only decrease from the verification date forward,
  and every decrease is an spl-token burn.**

## §2 Genesis supply — DOCUMENTED (not independently chain-verified)

- Jito's published tokenomics state a 1,000,000,000 JTO genesis supply.
- Chain-side corroboration: mint authority is null (§1), so current supply
  below 1B is consistent with burn-only decrease; 1B − 986,522,966.41 =
  **13,477,033.59 JTO net burned since genesis** as of 2026-08-24.
- Honest caveat, also stated in the methodology tab: if anything was minted
  between genesis and authority revocation, "burned since genesis" is net of
  it. Walking the mint's full history to prove otherwise exceeds free-tier RPC
  (§5); no evidence of a post-genesis mint exists.

## §3 Epoch cadence — VERIFIED 2026-08-24

- `getEpochInfo` (mainnet): epoch **1022**, absoluteSlot 441,548,662,
  slotIndex 44,662, slotsInEpoch 432,000.
- Alignment check: 441,548,662 − 44,662 = 441,504,000 = 1022 × 432,000 exactly.
  Epoch math in `epochs.ts` is nevertheless anchored to a live `getEpochInfo`
  read, not this constant, and is unit-tested against this capture.
- JIP-38's disclosure cadence is per Solana epoch (~2–2.5 days).

## §4 JIP-38 mechanism (from governance record)

JIP-38 (proposed 2026-07-13, approved ~2026-07-14) commits 100% of the Jito
DAO's JTX revenue share — 80% of total JTX platform fees — to programmatic
open-market JTO buybacks and burns via a "Rev Splitter" mechanism, at least one
year from JTX launch and running through a Q4 2027 review, with per-epoch
disclosure of fees collected / JTO acquired / JTO burned. The remaining 20% of
platform fees funds JTX development and is out of scope here.

## §5 Mint-history volume — MEASURED 2026-08-24

- `getSignaturesForAddress` on the mint returned 25 signatures spanning ~190
  seconds of wall clock (~11k mint-referencing transactions/day), nearly all
  ATA-creation/swap noise that merely references the mint account.
- Five of those transactions fetched and decoded: zero burn instructions —
  confirming burns are rare among mint-referencing traffic and full-history
  scanning is not viable on free-tier RPC.
- Consequence (shipped): bounded scan window (`SCAN_MAX_SIGNATURES`) with the
  honest "since <date>" label, and the verified pipeline account as the
  preferred low-volume scan target once it exists.

## §6 Rev Splitter / Layer 2 attribution — see below

(Filled by the address-verification section at the bottom of this file; if it
says UNVERIFIED, Layer 2 renders UNVERIFIED in the app.)
