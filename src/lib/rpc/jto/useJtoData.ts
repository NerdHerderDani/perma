import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import { rpcThrottledAtom, rpcStateAtom, rpcUrlAtom } from "../../../state/atoms";
import { TokenBucket } from "../rateLimiter";
import { RpcTransport } from "../transport";
import { fetchEpochInfo, fetchSupply } from "./supply";
import { scanBurns, type ScanProgress, type ScanWindow } from "./scan";
import type { BurnEvent } from "./decode";
import { JTO_MINT, REV_SPLITTER, SCAN_MAX_SIGNATURES } from "./constants";

export function useRpc() {
  const rpcUrl = useAtomValue(rpcUrlAtom);
  const setThrottled = useSetAtom(rpcThrottledAtom);
  return useMemo(() => {
    const url = rpcUrl.trim();
    if (!url.startsWith("https://")) return null;
    // One shared limiter for every read this app makes (free-tier friendly ~8rps).
    return new RpcTransport(url, new TokenBucket(8), setThrottled);
  }, [rpcUrl, setThrottled]);
}

export function useSupply() {
  const rpc = useRpc();
  const setRpcState = useSetAtom(rpcStateAtom);
  const query = useQuery({
    queryKey: ["supply", rpc != null],
    enabled: rpc != null,
    refetchInterval: 60_000,
    queryFn: async () => {
      if (!rpc) throw new Error("no rpc");
      const [supply, epochInfo] = [await fetchSupply(rpc), await fetchEpochInfo(rpc)];
      return { supply, epochInfo };
    },
  });
  useEffect(() => {
    if (!rpc) setRpcState("NOT SET");
    else if (query.isError) setRpcState("ERROR");
    else if (query.data) setRpcState("LIVE");
  }, [rpc, query.isError, query.data, setRpcState]);
  return query;
}

export interface BurnScanState {
  status: "idle" | "scanning" | "done" | "error";
  progress: ScanProgress | null;
  burns: BurnEvent[];
  window: ScanWindow | null;
  error: string | null;
  /** What the scan actually walked — pipeline account (attributed) or the raw mint. */
  target: "pipeline" | "mint";
}

const IDLE: BurnScanState = {
  status: "idle",
  progress: null,
  burns: [],
  window: null,
  error: null,
  target: REV_SPLITTER ? "pipeline" : "mint",
};

/**
 * Burn-event scan over a bounded signature window. When a verified Rev
 * Splitter account exists, its (low-volume) history is the scan target and
 * covers the whole JIP-38 pipeline; otherwise the mint's own recent window is
 * scanned and honestly labeled as such.
 */
export function useBurnScan() {
  const rpc = useRpc();
  const [state, setState] = useState<BurnScanState>(IDLE);
  const abortRef = useRef<AbortController | null>(null);
  const startedForRpc = useRef<RpcTransport | null>(null);

  useEffect(() => {
    if (!rpc || startedForRpc.current === rpc) return;
    startedForRpc.current = rpc;
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    const target = REV_SPLITTER ? "pipeline" : "mint";
    const address = REV_SPLITTER ? REV_SPLITTER.address : JTO_MINT;
    setState({ ...IDLE, status: "scanning", target });
    scanBurns({
      rpc,
      address,
      mint: JTO_MINT,
      maxSignatures: SCAN_MAX_SIGNATURES,
      signal: abort.signal,
      onProgress: (progress, burns) => setState((s) => ({ ...s, progress, burns: [...burns] })),
    })
      .then(({ burns, window }) => {
        if (abort.signal.aborted) return;
        setState((s) => ({ ...s, status: "done", burns, window }));
      })
      .catch((e: unknown) => {
        if (abort.signal.aborted) return;
        setState((s) => ({
          ...s,
          status: "error",
          error: e instanceof Error ? e.message : String(e),
        }));
      });
    return () => abort.abort();
  }, [rpc]);

  return state;
}
