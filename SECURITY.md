# Security Model

Perma is a fully static, client-side application. There is no backend.

## Key handling (the invariant)

- RPC URLs (which usually embed an API key) live in **React state in memory only**. They are
  never written to localStorage, IndexedDB, cookies, or any persistence layer. They die with
  the tab.
- Any PR that attaches persistence to `rpcUrlAtom` will be rejected. This is a review gate,
  not a suggestion.

## Data flow

user browser ── RPC reads ──> user-supplied Solana RPC endpoint
user browser ── nothing ──> us. No telemetry, no analytics, no server.

That is the entire data flow. Perma reads public chain state (the JTO mint, burn
transactions, epoch schedule) through whatever RPC endpoint you configure, and sends
nothing anywhere else. There is no AI integration, no price API, no third-party read
of any kind in this app.

## Trust model

Perma exists so you don't have to trust anyone's dashboard — including this one. Every
number links to the transaction(s) it was computed from, and the methodology tab documents
exactly how each figure is derived so you can recompute it against your own RPC. If Perma
and the official JIP-38 disclosures ever disagree, that divergence is a finding, not a bug
to hide.

## Reporting

Open a GitHub security advisory or issue. Do not include RPC URLs with embedded keys in reports.
