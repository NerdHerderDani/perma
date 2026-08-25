# Contributing

## Setup

```sh
npm install
npm run dev
```

## The gates (CI enforces all of these)

```sh
npm run lint        # eslint, zero warnings tolerated in CI
npm run typecheck   # tsc strict — the config is strict on purpose, don't loosen it
npm test            # vitest — decoders must stay fixture-covered
npm run format:check
npm run build
```

## Architecture rules

1. **Unknown renders as unknown.** Anything not verifiable from raw chain data renders
   "unverified" — never estimated, never interpolated. This is the product.
2. **No price content.** No token prices, no projections, no value framing, anywhere.
   Amounts are shown in SOL/JTO units. Non-negotiable.
3. **Decoders are fixture-tested.** Everything in `src/lib/rpc/jto/` is deterministic
   functions tested against real captured transactions in `__fixtures__/`.
4. **Zod at every boundary.** External data (RPC responses) is parsed before it enters
   app state.
5. **Keys never persist.** See SECURITY.md. Non-negotiable.
6. **Addresses ship with evidence.** Every address in `constants.ts` carries a
   verification date and a live transaction behind it, documented in
   `src/lib/rpc/jto/DECODING.md`.

## Style

Prettier owns formatting. Strong opinions live in code review, not in whitespace.
