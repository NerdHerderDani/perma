import { useState } from "react";
import { useAtomValue } from "jotai";
import { BootLog } from "./components/terminal/BootLog";
import { TabBar, type TabId } from "./components/terminal/TabBar";
import { Burns } from "./features/burns/Burns";
import { Methodology } from "./features/methodology/Methodology";
import { Config } from "./features/config/Config";
import { Support } from "./features/support/Support";
import { rpcStateAtom, rpcThrottledAtom } from "./state/atoms";

const rpcColor: Record<string, string> = {
  LIVE: "var(--perma-ice)",
  ERROR: "var(--perma-red)",
  "NOT SET": "var(--perma-amber)",
};

export function App() {
  const [booted, setBooted] = useState(false);
  const [tab, setTab] = useState<TabId>("burns");
  const rpcState = useAtomValue(rpcStateAtom);
  const throttled = useAtomValue(rpcThrottledAtom);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="scanlines" />
      <div className="vignette" />
      <div className="crt relative z-10 mx-auto max-w-5xl px-4 py-5">
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
          <h1
            className="text-4xl leading-none"
            style={{ textShadow: "0 0 12px #8fd6ff88, 0 0 40px #8fd6ff33" }}
          >
            PERMA{" "}
            <span style={{ color: "var(--perma-white)", textShadow: "0 0 14px #e6f7ff88" }}>
              霜
            </span>{" "}
            TERMINAL
          </h1>
          <div className="text-xs" style={{ color: "var(--perma-mid)" }}>
            {throttled && <span style={{ color: "var(--perma-red)" }}>RPC: THROTTLED </span>}
            RPC: <span style={{ color: rpcColor[rpcState] }}>{rpcState}</span>
          </div>
        </div>

        {!booted ? (
          <BootLog onDone={() => setBooted(true)} />
        ) : (
          <>
            <TabBar tab={tab} onTab={setTab} />
            {tab === "burns" && <Burns />}
            {tab === "method" && <Methodology />}
            {tab === "cfg" && <Config />}
            {tab === "don" && <Support />}
            <div className="mt-6 text-xs" style={{ color: "var(--perma-dim)" }}>
              perma · unaffiliated community tooling — not built, endorsed, or operated by Jito
              Labs, the Jito Foundation, or the Jito DAO · mechanism and receipts, nothing else
              <span className="cursor" style={{ color: "var(--perma-ice)" }}>
                █
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
