import { useState } from "react";

// Placeholder — intentionally NOT a valid Solana address. The real donation
// address goes in only with explicit operator confirmation (same pattern as
// Flurry v0). Until then the UI says so honestly.
export const DONATION_ADDRESS = "PLACEHOLDER-NOT-A-REAL-ADDRESS-DO-NOT-SEND";
export const DONATION_CONFIRMED = false;

export function Support() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(DONATION_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — user can select the text */
    }
  };
  return (
    <div className="max-w-xl">
      <pre className="mb-4 whitespace-pre-wrap text-sm">
        {`this terminal is free. no fees, no token, no telemetry,
no key custody. your RPC, your machine, your verification.

if it saved you from trusting a dashboard, the tip jar exists:`}
      </pre>
      {DONATION_CONFIRMED ? (
        <div className="flex flex-wrap items-center gap-2">
          <code
            className="px-2 py-1 text-xs"
            style={{
              background: "var(--perma-panel)",
              border: "1px solid var(--perma-dim)",
              color: "var(--perma-frost)",
            }}
          >
            {DONATION_ADDRESS}
          </code>
          <button
            onClick={() => void copy()}
            className="px-3 py-1 text-xs"
            style={{
              color: "var(--perma-bg)",
              background: copied ? "var(--perma-frost)" : "var(--perma-ice)",
              border: "none",
              cursor: "pointer",
            }}
          >
            {copied ? "COPIED" : "COPY SOL ADDR"}
          </button>
        </div>
      ) : (
        <p className="text-xs" style={{ color: "var(--perma-amber)" }}>
          tip jar not configured yet — no address to show. (perma never displays an address it
          can&apos;t stand behind, including its own.)
        </p>
      )}
      <p className="mt-4 text-xs" style={{ color: "var(--perma-mid)" }}>
        source on github · issues and PRs welcome
      </p>
    </div>
  );
}
