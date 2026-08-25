import {
  explorerAccount,
  JTO_MINT,
  REV_SPLITTER,
  SCAN_MAX_SIGNATURES,
} from "../../lib/rpc/jto/constants";

const linkStyle = { color: "var(--perma-frost)", textDecoration: "underline" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-1 text-sm" style={{ color: "var(--perma-frost)" }}>
        {title}
      </div>
      <div className="text-xs leading-relaxed" style={{ color: "var(--perma-ice)" }}>
        {children}
      </div>
    </div>
  );
}

export function Methodology() {
  return (
    <div className="max-w-2xl">
      <p className="mb-4 text-xs" style={{ color: "var(--perma-mid)" }}>
        how every number on the BURNS tab is computed. if a figure can&apos;t be traced through this
        page to raw chain data, it doesn&apos;t ship. the full research trail with capture dates
        lives in{" "}
        <a
          href="https://github.com/NerdHerderDani/perma/blob/main/src/lib/rpc/jto/DECODING.md"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          DECODING.md
        </a>
        .
      </p>

      <Section title="LAYER 1 — MINT TRUTH (always on, unattributed)">
        <p>
          <span style={{ color: "var(--perma-frost)" }}>ALL JTO BURNED (MINT-LEVEL)</span> = genesis
          supply (1,000,000,000 JTO) − live <code>getTokenSupply</code> on the{" "}
          <a
            href={explorerAccount(JTO_MINT)}
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            JTO mint
          </a>
          . The live read is indisputable chain fact from your own RPC. The genesis figure is
          Jito&apos;s documented 1B supply; the mint&apos;s <code>mintAuthority</code> is null
          (verified on-chain 2026-08-24), so supply can only decrease — every decrease is an
          spl-token burn. If anything was minted between genesis and authority revocation, this
          figure would be net of it; no evidence of such a mint exists, and the caveat is recorded
          rather than hidden.
        </p>
        <p className="mt-2">
          Burn <em>events</em> are found by scanning signature history and decoding spl-token{" "}
          <code>burn</code>/<code>burnChecked</code> instructions (top-level and CPI) whose mint is
          JTO. The decoder is fixture-tested against real captured transactions.
        </p>
      </Section>

      <Section title="LAYER 2 — JIP-38 ATTRIBUTION (requires verified addresses)">
        {REV_SPLITTER ? (
          <p>
            Burns attributed to JIP-38 are burns executed by the verified Rev Splitter pipeline
            account{" "}
            <a
              href={explorerAccount(REV_SPLITTER.address)}
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              {REV_SPLITTER.address}
            </a>{" "}
            ({REV_SPLITTER.role}, verified {REV_SPLITTER.verifiedOn} against live transactions — see
            DECODING.md).
          </p>
        ) : (
          <p style={{ color: "var(--perma-amber)" }}>
            NO VERIFIED REV SPLITTER ADDRESS YET. As of 2026-08-24 the Rev Splitter has no public
            on-chain footprint: the JIP-38 text names no addresses, no on-chain vote record exists
            (the governance program&apos;s proposals end at JIP-37), the promised per-epoch
            dashboards have not been published, and every JTO burn observed on-chain in the checked
            window is third-party dust — no programmatic buyback burn has happened yet. So every
            attributed figure renders UNVERIFIED — never estimated, never interpolated. The full
            negative-result evidence trail is in DECODING.md §6; the moment the pipeline appears
            on-chain it gets verified against live transactions and shipped with dates. Layer 1
            above is unaffected: mint-level burns are chain fact either way.
          </p>
        )}
        <p className="mt-2">
          FEES COLLECTED and JTO ACQUIRED per epoch additionally require verified decoders for the
          pipeline&apos;s fee-transfer and swap legs; until those are fixture-tested against real
          transactions, those columns render UNVERIFIED even when burns are attributed.
        </p>
      </Section>

      <Section title="SCAN WINDOW (the honest constraint)">
        <p>
          Free-tier RPC can&apos;t walk the JTO mint&apos;s full signature history (it is referenced
          by thousands of transactions a day, nearly all noise). Perma scans a bounded window of{" "}
          {SCAN_MAX_SIGNATURES.toLocaleString("en-US")} signatures per session and labels every
          derived figure with the window&apos;s actual start. When a verified pipeline account
          exists, its history is scanned instead — low-volume, so the window covers far more
          wall-clock time. A per-epoch row whose epoch begins before the window shows
          &ldquo;≥&rdquo; and &ldquo;window truncated&rdquo;.
        </p>
      </Section>

      <Section title="EPOCHS">
        <p>
          Epoch boundaries use mainnet&apos;s constant 432,000 slots/epoch (confirmed via{" "}
          <code>getEpochSchedule</code>, no warmup), anchored to a live <code>getEpochInfo</code>{" "}
          read rather than a hardcoded genesis alignment. JIP-38 promises &ldquo;per-epoch&rdquo;
          reporting without defining the term; the standard Solana epoch (~2–2.5 days) is the
          natural reading and the one Perma uses — stated here as an assumption, not a fact.
        </p>
      </Section>

      <Section title="COMPARISON AGAINST OFFICIAL DISCLOSURES">
        <p>
          JIP-38 commits Jito to publishing fees collected / JTO acquired / JTO burned every epoch.
          As of 2026-08-24{" "}
          <span style={{ color: "var(--perma-amber)" }}>no such disclosure exists yet</span> — the
          only official dashboard (the JTO Economic Hub) reports weekly revenue with no JTX,
          buyback, or burn line. Perma&apos;s numbers are computed independently from raw chain data
          so that when the promised dashboards appear, holders can check them instead of trusting
          them. Agreement is the product working; divergence is a finding worth surfacing (open an
          issue with both numbers and the epoch).
        </p>
      </Section>

      <Section title="WHAT PERMA WILL NEVER SHOW">
        <p>
          No token prices, no projections, no &ldquo;value&rdquo; framing. Amounts are SOL/JTO units
          and transaction receipts only. If a number can&apos;t be verified, it says UNVERIFIED — it
          is never estimated.
        </p>
      </Section>
    </div>
  );
}
