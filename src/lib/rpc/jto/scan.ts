import type { RpcCaller } from "../transport";
import { SignaturesSchema, type SignatureInfo } from "../../schemas";
import { extractBurns, type BurnEvent } from "./decode";

export interface ScanWindow {
  /** Oldest signature actually inspected — the honest "since" boundary. */
  oldestSlot: number | null;
  oldestBlockTime: number | null;
  signaturesScanned: number;
  /** True when the address's entire history fit inside the window. */
  historyExhausted: boolean;
}

export interface ScanProgress {
  signaturesScanned: number;
  transactionsFetched: number;
  burnsFound: number;
}

/**
 * Scan an address's signature history (newest → oldest) for JTO burns, up to
 * `maxSignatures`. Full mint history is too heavy for free-tier RPC — the
 * bounded window plus an honest "since <date>" label is the documented
 * constraint (see DECODING.md). Failed transactions are skipped without an
 * RPC fetch; every fetched transaction goes through the fixture-tested decoder.
 */
export async function scanBurns(opts: {
  rpc: RpcCaller;
  address: string;
  mint: string;
  maxSignatures: number;
  onProgress?: (progress: ScanProgress, burns: readonly BurnEvent[]) => void;
  signal?: AbortSignal;
}): Promise<{ burns: BurnEvent[]; window: ScanWindow }> {
  const { rpc, address, mint, maxSignatures, onProgress, signal } = opts;
  const burns: BurnEvent[] = [];
  let scanned = 0;
  let fetched = 0;
  let before: string | undefined;
  let oldest: SignatureInfo | null = null;
  let historyExhausted = false;

  while (scanned < maxSignatures && !signal?.aborted) {
    const limit = Math.min(1000, maxSignatures - scanned);
    const page = SignaturesSchema.parse(
      await rpc.call("getSignaturesForAddress", [address, before ? { limit, before } : { limit }]),
    );
    if (page.length === 0) {
      historyExhausted = true;
      break;
    }
    scanned += page.length;
    const last = page[page.length - 1];
    if (last) {
      before = last.signature;
      oldest = last;
    }

    for (const sig of page) {
      if (signal?.aborted) break;
      if (sig.err != null) continue;
      const tx = await rpc.call("getTransaction", [
        sig.signature,
        { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
      ]);
      fetched++;
      if (tx == null) continue;
      burns.push(...extractBurns(tx, mint));
      onProgress?.(
        { signaturesScanned: scanned, transactionsFetched: fetched, burnsFound: burns.length },
        burns,
      );
    }
    if (page.length < limit) {
      historyExhausted = true;
      break;
    }
  }

  return {
    burns,
    window: {
      oldestSlot: oldest?.slot ?? null,
      oldestBlockTime: oldest?.blockTime ?? null,
      signaturesScanned: scanned,
      historyExhausted,
    },
  };
}
