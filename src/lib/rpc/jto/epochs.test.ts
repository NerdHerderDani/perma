import { describe, expect, it } from "vitest";
import { epochForSlot, epochSlotRange, SLOTS_PER_EPOCH } from "./epochs";

// Live anchor captured 2026-08-24 from mainnet getEpochInfo (see DECODING.md).
const anchor = {
  absoluteSlot: 441_548_662,
  epoch: 1022,
  slotIndex: 44_662,
  slotsInEpoch: 432_000,
};

describe("epochForSlot", () => {
  it("maps the anchor slot to the anchor epoch", () => {
    expect(epochForSlot(anchor.absoluteSlot, anchor)).toBe(1022);
  });

  it("maps epoch boundaries exactly", () => {
    const epochStart = anchor.absoluteSlot - anchor.slotIndex;
    expect(epochForSlot(epochStart, anchor)).toBe(1022);
    expect(epochForSlot(epochStart - 1, anchor)).toBe(1021);
    expect(epochForSlot(epochStart + SLOTS_PER_EPOCH, anchor)).toBe(1023);
  });

  it("agrees with mainnet's exact alignment (epoch 1022 starts at 1022 * 432000)", () => {
    // Cross-check: mainnet epoch starts are exact multiples of 432000 in this range.
    expect(anchor.absoluteSlot - anchor.slotIndex).toBe(1022 * SLOTS_PER_EPOCH);
  });
});

describe("epochSlotRange", () => {
  it("is the inverse of epochForSlot at both ends", () => {
    const { firstSlot, lastSlot } = epochSlotRange(1020, anchor);
    expect(epochForSlot(firstSlot, anchor)).toBe(1020);
    expect(epochForSlot(lastSlot, anchor)).toBe(1020);
    expect(epochForSlot(lastSlot + 1, anchor)).toBe(1021);
    expect(lastSlot - firstSlot + 1).toBe(SLOTS_PER_EPOCH);
  });
});
