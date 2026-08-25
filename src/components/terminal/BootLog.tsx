import { useEffect, useState } from "react";

const BOOT = [
  "PERMA 霜 v0.1.0",
  "(c) 2026 — free forever. your RPC, your verification.",
  "",
  "> init renderer .............. OK",
  "> load burn decoders ......... OK",
  "> jto mint ................... jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
  "> rpc endpoint ............... NOT SET (configure in F3)",
  "",
  "READY. [F1] BURNS  [F2] METHODOLOGY  [F3] CONFIG  [F4] SUPPORT",
];

export function BootLog({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= BOOT.length) {
      const t = setTimeout(onDone, 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN((v) => v + 1), n < 3 ? 220 : 90);
    return () => clearTimeout(t);
  }, [n, onDone]);
  return (
    <pre className="mt-6 text-sm" style={{ textShadow: "0 0 6px #8fd6ff44" }}>
      {BOOT.slice(0, n).join("\n")}
      <span className="cursor">█</span>
    </pre>
  );
}
