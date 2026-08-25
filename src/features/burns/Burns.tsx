import { useAtomValue } from "jotai";
import { rpcUrlAtom } from "../../state/atoms";
import { useBurnScan, useSupply } from "../../lib/rpc/jto/useJtoData";
import { burnedSinceGenesisRaw } from "../../lib/rpc/jto/supply";
import { formatRawJto } from "../../lib/rpc/jto/decode";
import { groupBurnsByEpoch, reconstructSupply } from "../../lib/rpc/jto/epochTable";
import { epochForSlot } from "../../lib/rpc/jto/epochs";
import { explorerAccount, explorerTx, JTO_MINT, REV_SPLITTER } from "../../lib/rpc/jto/constants";
import { SupplyChart } from "./SupplyChart";

const linkStyle = { color: "var(--perma-frost)", textDecoration: "underline" };
const UNVERIFIED = (
  <span
    style={{ color: "var(--perma-amber)" }}
    title="Not verifiable from chain evidence yet — never estimated."
  >
    UNVERIFIED
  </span>
);

function fmtTime(unixSec: number | null): string {
  if (unixSec == null) return "—";
  return new Date(unixSec * 1000).toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

function Tile({
  label,
  children,
  sub,
}: {
  label: string;
  children: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div
      className="p-3"
      style={{ border: "1px solid var(--perma-dim)", background: "var(--perma-panel)" }}
    >
      <div className="text-xs" style={{ color: "var(--perma-mid)" }}>
        {label}
      </div>
      <div
        className="mt-1 text-2xl"
        style={{ color: "var(--perma-frost)", textShadow: "0 0 10px #8fd6ff44" }}
      >
        {children}
      </div>
      {sub && (
        <div className="mt-1 text-xs" style={{ color: "var(--perma-mid)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export function Burns() {
  const rpcUrl = useAtomValue(rpcUrlAtom);
  const supplyQuery = useSupply();
  const scan = useBurnScan();

  if (!rpcUrl.trim()) {
    return (
      <pre className="mt-4 whitespace-pre-wrap text-sm" style={{ color: "var(--perma-mid)" }}>
        {`no RPC endpoint configured. perma computes every number from raw chain
data via your own RPC — there is no default feed and no cached numbers.

[F3] CONFIG → paste a Solana RPC URL (free key at helius.dev).`}
      </pre>
    );
  }

  const data = supplyQuery.data;
  const supply = data?.supply ?? null;
  const anchor = data?.epochInfo ?? null;

  const burnedTotal = supply ? burnedSinceGenesisRaw(supply.supplyRaw) : null;
  const rows = anchor && scan.burns.length > 0 ? groupBurnsByEpoch(scan.burns, anchor) : [];
  const lastBurn = scan.burns.reduce<(typeof scan.burns)[number] | null>(
    (acc, b) => (acc == null || b.slot > acc.slot ? b : acc),
    null,
  );
  const windowStart = scan.window?.oldestBlockTime ?? null;
  const windowCoversEpoch = (epoch: number): boolean => {
    if (!anchor || !scan.window) return false;
    if (scan.window.historyExhausted) return true;
    const oldestSlot = scan.window.oldestSlot;
    return oldestSlot != null && epochForSlot(oldestSlot, anchor) < epoch;
  };
  const attributed = REV_SPLITTER != null && scan.target === "pipeline";
  const chartPoints =
    supply && scan.burns.length > 0
      ? reconstructSupply({ supplyRaw: supply.supplyRaw, slot: supply.slot }, scan.burns)
      : [];
  const currentEpoch = anchor?.epoch ?? null;
  const currentRow = currentEpoch != null ? rows.find((r) => r.epoch === currentEpoch) : undefined;

  return (
    <div>
      {/* status line */}
      <div className="mb-3 text-xs" style={{ color: "var(--perma-mid)" }}>
        {supplyQuery.isError && (
          <span style={{ color: "var(--perma-red)" }}>RPC ERROR: {String(supplyQuery.error)} </span>
        )}
        SUPPLY READ:{" "}
        <span style={{ color: supply ? "var(--perma-ice)" : "var(--perma-amber)" }}>
          {supply ? `slot ${supply.slot.toLocaleString("en-US")}` : "PENDING"}
        </span>{" "}
        · EPOCH: <span style={{ color: "var(--perma-ice)" }}>{currentEpoch ?? "—"}</span> · SCAN:{" "}
        <span style={{ color: scan.status === "error" ? "var(--perma-red)" : "var(--perma-ice)" }}>
          {scan.status === "scanning" && scan.progress
            ? `${scan.progress.transactionsFetched} tx inspected…`
            : scan.status.toUpperCase()}
        </span>{" "}
        · LAST VERIFIED BURN:{" "}
        {lastBurn ? (
          <a
            href={explorerTx(lastBurn.signature)}
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            {fmtTime(lastBurn.blockTime)}
          </a>
        ) : (
          <span style={{ color: "var(--perma-amber)" }}>none in window</span>
        )}
      </div>

      {/* hero numbers */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Tile
          label="ALL JTO BURNED (MINT-LEVEL)"
          sub={
            <>
              genesis 1,000,000,000 − live supply ·{" "}
              <a
                href={explorerAccount(JTO_MINT)}
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                mint
              </a>{" "}
              · provenance in [F2]
            </>
          }
        >
          {burnedTotal ? `${formatRawJto(burnedTotal)} JTO` : "—"}
        </Tile>
        <Tile
          label="ATTRIBUTED TO JIP-38"
          sub={
            attributed
              ? "burns executed by the verified Rev Splitter pipeline"
              : "no verified Rev Splitter address yet — see [F2]"
          }
        >
          {attributed && scan.status === "done"
            ? `${formatRawJto(rows.reduce((acc, r) => (BigInt(acc) + BigInt(r.burnedRaw)).toString(), "0"))} JTO`
            : UNVERIFIED}
        </Tile>
        <Tile
          label={`EPOCH ${currentEpoch ?? "—"}: FEES → BOUGHT → BURNED`}
          sub={
            attributed
              ? "current epoch, pipeline-attributed"
              : "requires verified attribution — see [F2]"
          }
        >
          {attributed && currentEpoch != null && windowCoversEpoch(currentEpoch) ? (
            <span className="text-lg">
              {UNVERIFIED} → {UNVERIFIED} →{" "}
              {currentRow ? `${formatRawJto(currentRow.burnedRaw)} JTO` : "0 JTO"}
            </span>
          ) : (
            UNVERIFIED
          )}
        </Tile>
      </div>

      {/* supply chart */}
      <div className="mt-4">
        <div className="mb-1 text-xs" style={{ color: "var(--perma-mid)" }}>
          JTO TOTAL SUPPLY — reconstructed from burn events observed{" "}
          {windowStart ? `since ${fmtTime(windowStart)}` : "in the scanned window"}
          {scan.window?.historyExhausted === false && " (bounded window, not full history)"}
        </div>
        {chartPoints.length >= 2 ? (
          <SupplyChart points={chartPoints} />
        ) : (
          <div
            className="p-3 text-xs"
            style={{ border: "1px dashed var(--perma-dim)", color: "var(--perma-mid)" }}
          >
            {scan.status === "scanning"
              ? "scanning for burn events…"
              : "no burn events observed in the scanned window — nothing to chart. unknown renders as unknown."}
          </div>
        )}
      </div>

      {/* per-epoch table */}
      <div className="mt-4">
        <div className="mb-1 text-xs" style={{ color: "var(--perma-mid)" }}>
          PER-EPOCH LEDGER{" "}
          {attributed
            ? "(pipeline-attributed)"
            : "(mint-level burns in scanned window; fees/acquired require verified attribution)"}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: "var(--perma-mid)" }}>
                {["EPOCH", "FEES COLLECTED", "JTO ACQUIRED", "JTO BURNED", "EVIDENCE"].map((h) => (
                  <th
                    key={h}
                    className="px-2 py-1 text-left"
                    style={{ borderBottom: "1px solid var(--perma-dim)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-2 py-2" style={{ color: "var(--perma-mid)" }}>
                    {scan.status === "scanning"
                      ? "scanning…"
                      : "no burn events in the scanned window"}
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.epoch} style={{ borderBottom: "1px solid var(--perma-dim)" }}>
                  <td className="px-2 py-1" style={{ color: "var(--perma-frost)" }}>
                    {r.epoch}
                  </td>
                  <td className="px-2 py-1">{UNVERIFIED}</td>
                  <td className="px-2 py-1">{UNVERIFIED}</td>
                  <td className="px-2 py-1" style={{ color: "var(--perma-frost)" }}>
                    {windowCoversEpoch(r.epoch) ? "" : "≥ "}
                    {formatRawJto(r.burnedRaw)} JTO
                    {!windowCoversEpoch(r.epoch) && (
                      <span
                        style={{ color: "var(--perma-amber)" }}
                        title="Scan window starts inside this epoch — earlier burns in it may exist."
                      >
                        {" "}
                        (window truncated)
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-1">
                    {r.burns.slice(0, 6).map((b) => (
                      <a
                        key={b.signature}
                        href={explorerTx(b.signature)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ ...linkStyle, marginRight: 8 }}
                      >
                        {b.signature.slice(0, 8)}…
                      </a>
                    ))}
                    {r.burns.length > 6 && (
                      <span style={{ color: "var(--perma-mid)" }}>+{r.burns.length - 6} more</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
