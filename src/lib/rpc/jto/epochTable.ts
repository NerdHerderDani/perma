import type { EpochInfo } from "../../schemas";
import { epochForSlot } from "./epochs";
import { sumRaw, type BurnEvent } from "./decode";

export interface EpochRow {
  epoch: number;
  burnedRaw: string;
  burns: BurnEvent[];
  firstBlockTime: number | null;
  lastBlockTime: number | null;
}

/** Group decoded burn events into per-epoch rows, newest epoch first. */
export function groupBurnsByEpoch(burns: readonly BurnEvent[], anchor: EpochInfo): EpochRow[] {
  const byEpoch = new Map<number, BurnEvent[]>();
  for (const b of burns) {
    const epoch = epochForSlot(b.slot, anchor);
    const list = byEpoch.get(epoch);
    if (list) list.push(b);
    else byEpoch.set(epoch, [b]);
  }
  return [...byEpoch.entries()]
    .sort(([a], [b]) => b - a)
    .map(([epoch, events]) => {
      const times = events.map((e) => e.blockTime).filter((t): t is number => t != null);
      return {
        epoch,
        burnedRaw: sumRaw(events.map((e) => e.amountRaw)),
        burns: events,
        firstBlockTime: times.length ? Math.min(...times) : null,
        lastBlockTime: times.length ? Math.max(...times) : null,
      };
    });
}

export interface SupplyPoint {
  slot: number;
  blockTime: number | null;
  supplyRaw: string;
}

/**
 * Reconstruct supply-over-time backwards from a live reading using observed
 * burn events: supply before a burn = supply after it + the burned amount.
 * Exact within the scanned window; the chart labels the window it covers.
 */
export function reconstructSupply(
  current: { supplyRaw: string; slot: number },
  burns: readonly BurnEvent[],
): SupplyPoint[] {
  const sorted = [...burns].sort((a, b) => b.slot - a.slot);
  const points: SupplyPoint[] = [
    { slot: current.slot, blockTime: null, supplyRaw: current.supplyRaw },
  ];
  let running = BigInt(current.supplyRaw);
  for (const b of sorted) {
    points.push({ slot: b.slot, blockTime: b.blockTime, supplyRaw: running.toString() });
    running += BigInt(b.amountRaw);
    points.push({ slot: b.slot - 1, blockTime: b.blockTime, supplyRaw: running.toString() });
  }
  return points.reverse();
}
