import type { EpochInfo } from "../../schemas";

/**
 * Mainnet epochs are a constant 432,000 slots in the entire range Perma cares
 * about (JTX launched July 2026, epoch ~1000+). Rather than hardcoding an
 * epoch-zero alignment, all epoch math is anchored to a live getEpochInfo
 * response, so a wrong assumption about ancient history can't skew anything.
 */
export const SLOTS_PER_EPOCH = 432_000;

export function epochForSlot(slot: number, anchor: EpochInfo): number {
  const anchorEpochStart = anchor.absoluteSlot - anchor.slotIndex;
  return anchor.epoch + Math.floor((slot - anchorEpochStart) / SLOTS_PER_EPOCH);
}

export function epochSlotRange(
  epoch: number,
  anchor: EpochInfo,
): { firstSlot: number; lastSlot: number } {
  const anchorEpochStart = anchor.absoluteSlot - anchor.slotIndex;
  const firstSlot = anchorEpochStart + (epoch - anchor.epoch) * SLOTS_PER_EPOCH;
  return { firstSlot, lastSlot: firstSlot + SLOTS_PER_EPOCH - 1 };
}
