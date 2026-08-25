# PERMA 霜 TERMINAL

Independent, live, on-chain verification of **JIP-38**: JTX platform fees →
Rev Splitter → open-market JTO buybacks → burns. Every number computed from raw
chain data via **your own RPC**, methodology public, every figure clickable to
its transaction evidence.

**Free forever. BYOK. Zero custody. No backend, no telemetry, no token.**

Sibling of [FLURRY 慌](https://github.com/NerdHerderDani/flurry) — same terminal
family, same security model, same honesty laws. Flurry runs phosphor green;
Perma runs frost.

## Why this exists

JIP-38 promises per-epoch disclosure of fees collected, JTO acquired, and JTO
burned, executed by the Rev Splitter under Dev Council management. Perma is the
independent verifier: the same numbers, recomputed from raw chain data through
whatever RPC endpoint _you_ supply, so holders can check the official reports
instead of trusting them. Agreement is the product working; divergence is a
finding worth surfacing.

Perma is unaffiliated community tooling — not built, endorsed, or operated by
Jito Labs, the Jito Foundation, or the Jito DAO.

## The two honesty laws

1. **Unknown renders as unknown.** Anything not verifiable from chain evidence
   says `UNVERIFIED` — never estimated, never interpolated.
2. **Zero price content.** No token prices, no projections, no value framing,
   anywhere. Mechanism and receipts only.

## Two-layer data model

- **Layer 1 — mint truth (always on, unattributed):** total JTO burned,
  computed from live supply and burn instructions decoded on the JTO mint.
  Indisputable chain fact; works even if pipeline attribution is incomplete.
- **Layer 2 — JIP-38 attribution (requires verified addresses):** burns
  attributable to the Rev Splitter pipeline, plus fees collected and JTO
  acquired per epoch. Every address ships only with live transaction evidence
  behind it, documented with verification dates in
  [`src/lib/rpc/jto/DECODING.md`](src/lib/rpc/jto/DECODING.md). Anything not
  yet verifiable renders `UNVERIFIED`.

## How it works

- **Fully static.** The entire app is client-side. Deploys to GitHub Pages.
- **BYOK.** You supply your own Solana RPC endpoint (free key at
  [helius.dev](https://www.helius.dev)). It lives in memory for the session
  only — see [SECURITY.md](SECURITY.md).
- **Fixture-tested decoders.** Burn instruction decoding is tested against real
  captured transactions in `src/lib/rpc/jto/__fixtures__/`.
- **Bounded scan window.** Free-tier RPC can't walk the mint's full history;
  Perma scans a bounded signature window and labels every derived figure with
  the window's actual start. The constraint is documented, not hidden.

## Run it

```sh
npm install
npm run dev
```

## Status

| Surface                                       | State             |
| --------------------------------------------- | ----------------- |
| Terminal UI, tabs, boot sequence              | ✅                |
| Layer 1 mint-truth burns (live + fixtures)    | ✅ fixture-tested |
| Per-epoch table with explorer links           | ✅                |
| Supply chart (reconstructed from burn events) | ✅                |
| Methodology tab                               | ✅                |
| Layer 2 Rev Splitter attribution              | see DECODING.md   |

## Not financial advice

It's receipts. Perma shows what the chain records — burn transactions, supply
reads, epoch boundaries — and nothing else. No prices, no projections, no
advice of any kind.

<!-- DISCLOSURE SECTION INTENTIONALLY ABSENT: exact wording requires operator
approval before it enters any commit. See PR discussion. -->

## License

Apache-2.0
