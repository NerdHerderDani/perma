import { describe, expect, it } from "vitest";
import { groupBurnsByEpoch, reconstructSupply } from "./epochTable";
import type { BurnEvent } from "./decode";

const anchor = {
  absoluteSlot: 441_548_662,
  epoch: 1022,
  slotIndex: 44_662,
  slotsInEpoch: 432_000,
};

const burn = (slot: number, amountRaw: string, blockTime = 1_787_000_000): BurnEvent => ({
  signature: `sig-${slot}`,
  slot,
  blockTime,
  amountRaw,
  authority: "auth",
  sourceAccount: "src",
});

describe("groupBurnsByEpoch", () => {
  it("groups burns into epochs and sums raw amounts exactly", () => {
    const e1022Start = 1022 * 432_000;
    const rows = groupBurnsByEpoch(
      [
        burn(e1022Start + 10, "1000000000"),
        burn(e1022Start + 20, "2500000000"),
        burn(e1022Start - 5, "7000000000"), // epoch 1021
      ],
      anchor,
    );
    expect(rows.map((r) => r.epoch)).toEqual([1022, 1021]);
    expect(rows[0]?.burnedRaw).toBe("3500000000");
    expect(rows[1]?.burnedRaw).toBe("7000000000");
    expect(rows[0]?.burns).toHaveLength(2);
  });

  it("handles amounts beyond Number.MAX_SAFE_INTEGER without loss", () => {
    const rows = groupBurnsByEpoch(
      [burn(1022 * 432_000, "9007199254740993"), burn(1022 * 432_000 + 1, "1")],
      anchor,
    );
    expect(rows[0]?.burnedRaw).toBe("9007199254740994");
  });
});

describe("reconstructSupply", () => {
  it("steps supply up going back through each burn", () => {
    const points = reconstructSupply({ supplyRaw: "1000", slot: 100 }, [
      burn(50, "10"),
      burn(80, "5"),
    ]);
    // Oldest first: before slot-50 burn the supply was 1000 + 5 + 10.
    expect(points[0]?.supplyRaw).toBe("1015");
    expect(points[points.length - 1]?.supplyRaw).toBe("1000");
    expect(points[points.length - 1]?.slot).toBe(100);
  });
});
