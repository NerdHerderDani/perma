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
 *
 * Burns are first collapsed per slot. Two burns can share a slot — a
 * multi-mint dust-batch tx that happens to include two JTO burns, or two
 * independent burn txs landing in the same slot — and treating each as its
 * own "slot - 1" step produces a slot sequence that goes backwards
 * (e.g. 99 → 100 → 99 → 100) instead of stepping monotonically through time.
 */
export function reconstructSupply(
  current: { supplyRaw: string; slot: number },
  burns: readonly BurnEvent[],
): SupplyPoint[] {
  const bySlot = new Map<number, { amountRaw: bigint; blockTime: number | null }>();
  for (const b of burns) {
    const amount = BigInt(b.amountRaw);
    const existing = bySlot.get(b.slot);
    if (existing) existing.amountRaw += amount;
    else bySlot.set(b.slot, { amountRaw: amount, blockTime: b.blockTime });
  }
  const slots = [...bySlot.entries()].sort(([a], [b]) => b - a);

  const points: SupplyPoint[] = [
    { slot: current.slot, blockTime: null, supplyRaw: current.supplyRaw },
  ];
  let running = BigInt(current.supplyRaw);
  for (const [slot, { amountRaw, blockTime }] of slots) {
    points.push({ slot, blockTime, supplyRaw: running.toString() });
    running += amountRaw;
    points.push({ slot: slot - 1, blockTime, supplyRaw: running.toString() });
  }
  return points.reverse();
}
