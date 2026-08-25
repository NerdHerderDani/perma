import type { SupplyPoint } from "../../lib/rpc/jto/epochTable";

/**
 * Step chart of JTO total supply, reconstructed from observed burn events
 * (exact within the scanned window — the caller labels the window). Pure SVG,
 * no chart lib: it's a monotone step-down line, nothing more.
 */
export function SupplyChart({ points }: { points: SupplyPoint[] }) {
  if (points.length < 2) return null;
  const w = 640;
  const h = 120;
  const pad = 4;

  const slots = points.map((p) => p.slot);
  const values = points.map((p) => Number(BigInt(p.supplyRaw) / 1_000_000_000n));
  const minSlot = Math.min(...slots);
  const maxSlot = Math.max(...slots);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const spanV = maxV - minV || 1;
  const spanS = maxSlot - minSlot || 1;

  const x = (slot: number) => pad + ((slot - minSlot) / spanS) * (w - 2 * pad);
  const y = (v: number) => h - pad - ((v - minV) / spanV) * (h - 2 * pad);

  let d = "";
  points.forEach((p, i) => {
    const v = values[i];
    if (v === undefined) return;
    d += `${i === 0 ? "M" : "L"}${x(p.slot).toFixed(1)},${y(v).toFixed(1)}`;
  });

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full"
      role="img"
      aria-label="JTO total supply over the scanned window"
      style={{ border: "1px solid var(--perma-dim)", background: "var(--perma-panel)" }}
    >
      <path d={d} fill="none" stroke="var(--perma-ice)" strokeWidth="1.5" />
      <text x={pad + 2} y={12} fontSize="9" fill="var(--perma-mid)" fontFamily="inherit">
        {maxV.toLocaleString("en-US")} JTO
      </text>
      <text x={pad + 2} y={h - 8} fontSize="9" fill="var(--perma-mid)" fontFamily="inherit">
        {minV.toLocaleString("en-US")} JTO
      </text>
    </svg>
  );
}
