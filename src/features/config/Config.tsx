import { useAtom } from "jotai";
import { rpcUrlAtom } from "../../state/atoms";

const linkStyle = { color: "var(--perma-frost)", textDecoration: "underline" };

export function Config() {
  const [rpcUrl, setRpcUrl] = useAtom(rpcUrlAtom);
  const rpcLooksLikeBareKey = rpcUrl.trim().length > 0 && !rpcUrl.trim().startsWith("https://");

  return (
    <div className="max-w-xl">
      <p className="mb-4 text-xs" style={{ color: "var(--perma-mid)" }}>
        everything runs in your browser. the RPC URL is held in memory for this session only —
        nothing is stored, nothing is sent anywhere except the endpoint you configure.
      </p>
      <div className="mb-4">
        <div className="mb-1 text-xs" style={{ color: "var(--perma-mid)" }}>
          SOLANA RPC ENDPOINT
        </div>
        <input
          value={rpcUrl}
          onChange={(e) => setRpcUrl(e.target.value)}
          placeholder="https://your-rpc-provider.example/..."
          className="w-full px-2 py-1 text-sm outline-none"
          style={{
            background: "var(--perma-panel)",
            border: "1px solid var(--perma-dim)",
            color: "var(--perma-ice)",
          }}
        />
        {rpcLooksLikeBareKey && (
          <p className="mt-1 text-xs" style={{ color: "var(--perma-amber)" }}>
            that looks like a bare API key — paste the full RPC URL from your provider&apos;s
            dashboard.
          </p>
        )}
        <p className="mt-1 text-xs" style={{ color: "var(--perma-mid)" }}>
          expected shape:{" "}
          <span style={{ color: "var(--perma-ice)" }}>
            https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
          </span>{" "}
          (or any Solana RPC provider&apos;s full URL). no key yet? get a free one at{" "}
          <a
            href="https://www.helius.dev"
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            helius.dev
          </a>
          .
        </p>
        <p className="mt-1 text-xs" style={{ color: "var(--perma-amber)" }}>
          live supply, burn scanning, and the per-epoch table read from this endpoint. burn history
          is scanned in a bounded window on free-tier limits — the BURNS tab labels exactly how far
          back it looked.
        </p>
      </div>
    </div>
  );
}
