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
- `getEpochSchedule` confirms 432,000 slots/epoch with no warmup on mainnet.
- JIP-38 promises "per-epoch" reporting without defining the term; Perma uses
  the standard Solana epoch (~2–2.5 days) and labels it as an assumption.

## §4 JIP-38 mechanism (from governance record)

JIP-38 (posted 2026-07-13 by drnick on forum.jito.network, thread 973, status
OFFICIAL) commits 100% of the Jito DAO's JTX revenue share — 80% of total JTX
platform fees — to programmatic open-market JTO buybacks and burns via a "Rev
Splitter" mechanism ("the programmatic fee collection and buyback system …
actively managed by the Dev Council under revocable delegated authority"),
at least one year from JTX launch and running through a Q4 2027 review, with
per-epoch dashboards for fees collected / JTO acquired / JTO burned promised
("will be produced for the DAO"). The remaining 20% of platform fees funds JTX
development and is out of scope here.

Honesty notes on the governance record (checked 2026-08-24):

- The proposal text contains **zero base58 addresses, program IDs, or links**
  (regex-scanned the raw markdown for base58 strings of length 32–44: none).
  It never defines "epoch" and never names a buyback venue.
- **No on-chain vote record found.** All 4,064 accounts of the Jito governance
  program `jtogvBNH3WBSWDYD5FJfQP2ZxNTuf82zL8GkEhPeaJx` (realm
  `jjCAwuuNpJCNMLAanpwgJZ6cdXzLPXe2GfD6TaDQBXt`) were dumped and decoded: the
  on-chain proposal set ends at JIP-37. "Approved ~2026-07-14" is sourced to
  press coverage and the forum's OFFICIAL tag, not to chain.

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

## §6 Rev Splitter / Layer 2 attribution — UNVERIFIED as of 2026-08-24

**The Rev Splitter has no public on-chain footprint yet.** Layer 2 therefore
ships with `REV_SPLITTER = null` and every attributed figure renders
UNVERIFIED. This verdict rests on four independent negative results, all
captured 2026-08-24:

1. **No address in the governance record.** The JIP-38 text names no program
   ID, fee wallet, or burn authority (§4). JIP-36's authority architecture
   (two-hop Squads v4 under the DAO governance PDA, Dev Council quorum 4-of-7,
   12h timelock) names no concrete Squads addresses either.
2. **No official disclosure.** JIP-38's promised per-epoch dashboards do not
   exist. The only official dashboard, the JTO Economic Hub
   (jito.network/economic-hub), reports **weekly** revenue in exactly two
   streams (JitoSOL Fees, Jito Tip Fees) — no JTX line, no "JTO acquired",
   no "JTO burned" (checked 2026-08-24: weeks 2026-07-27 through 2026-08-24).
3. **No repo, no docs.** github.com/jito-foundation was enumerated (~95
   repos): no Rev Splitter repo (`jito-bam-boost-cli`, the sibling program
   JIP-38 references, does exist). The jito-omnidocs corpus contains no
   "Rev Splitter" or JIP-38 content. Forum search for "Rev Splitter" returns
   exactly one post: the JIP-38 body itself.
4. **No programmatic burn observed on-chain.** Solscan's burn-filtered
   transfer feed for the JTO mint (9,590 burn transfers all-time) was paged
   burn-by-burn across ~2026-08-19 → 08-24: every burn is third-party dust
   (0.009–0.12 JTO, sub-$0.10), e.g. batch dust-incinerator transactions like
   the captured fixture (§7). No buyback-scale or recurring programmatic burn
   exists in the observed window.

Also recorded: the live JTX app (app.jtx.com) routes orders "via DFlow" with a
platform-fee line, but its quote API requires auth and the fee account is not
in the client bundle — the JTX fee collection address is therefore also
unverifiable today. JIP-38 does not name the buyback venue.

**Re-verification trigger:** the moment a Rev Splitter address is published
(Jito forum/docs) or a recurring programmatic JTO burn appears on-chain,
verify it against live transactions, record the evidence here with dates, fill
`REV_SPLITTER` in `constants.ts`, and add captured fixtures for the fee /
swap / burn legs. Until then: unknown renders as unknown.

## §7 Captured fixtures

- `__fixtures__/burn-tx-1-dust-batch.json` — real mainnet tx
  `Zrxk7xfKifzezNif5ZDepsDBfgZAuGsYHbqFht2q95xy81DQUM7YgQnpzJNPcNPEy5X2SrABE4whbKkwTMHKFdX`
  (slot 440,333,153, 2026-08-19): a dust-incinerator batch burning five
  different mints in one transaction, including 0.017577781 JTO. Captured via
  `getTransaction` jsonParsed 2026-08-24. Exercises the decoder's mint filter,
  burnChecked raw-amount extraction, and multi-burn-per-tx handling. It is
  also direct evidence that mint-level burn events include third-party noise —
  which is why Layer 1 is labeled "all JTO burns (mint-level)", never
  attributed to JIP-38.

## §8 Official-dashboard comparison notes (DoD item)

What Jito publishes today (2026-08-24) vs what Perma computes:

| Jito publishes (Economic Hub)       | Perma computes                          |
| ----------------------------------- | --------------------------------------- |
| Weekly revenue, JitoSOL + Tips only | —(out of scope: not JIP-38 streams)     |
| Total supply "1.0B" (static)        | Live supply via getTokenSupply (§1)     |
| Nothing on JTX fees                 | UNVERIFIED until addresses exist (§6)   |
| Nothing on JTO acquired/burned      | Layer 1 mint-level burns, live + linked |
| No per-epoch table                  | Per-epoch table (burn column live)      |

CoinGecko reports total_supply as a flat 1,000,000,000 while the chain says
986,522,966.41 — a third-party data-source discrepancy Perma's live read
makes visible, and not attributable to JIP-38 (the ~13.5M gap predates it and
mint-level burn history is dominated by dust).

There is no official per-epoch fees/acquired/burned number to compare against
yet. When Jito's promised dashboards appear, agreement is Perma working;
divergence is a finding worth surfacing.
