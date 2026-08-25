import { describe, expect, it } from "vitest";
import { extractBurns, formatRawJto, sumRaw } from "./decode";
import { JTO_MINT } from "./constants";
import dustBatch from "./__fixtures__/burn-tx-1-dust-batch.json";

describe("extractBurns — real captured transactions", () => {
  it("picks out exactly the JTO burn from a multi-mint dust-incinerator batch", () => {
    // Zrxk7xfK… (slot 440,333,153): five burnChecked instructions across five
    // different mints; only one is on the JTO mint.
    const burns = extractBurns(dustBatch, JTO_MINT);
    expect(burns).toHaveLength(1);
    const b = burns[0];
    expect(b?.amountRaw).toBe("17577781");
    expect(b?.slot).toBe(440_333_153);
    expect(b?.blockTime).toBe(1_787_170_758);
    expect(b?.authority).toBe("DobR4jqkSpSSA6yfptYDF8v8q7G2RHmx1BR1eNZ6J7qF");
    expect(b?.sourceAccount).toBe("BdQzbXPrgtk9PJRstJcFAtHAUx2HDfUKLJBPDRHUehtN");
    expect(b?.signature).toBe(
      "Zrxk7xfKifzezNif5ZDepsDBfgZAuGsYHbqFht2q95xy81DQUM7YgQnpzJNPcNPEy5X2SrABE4whbKkwTMHKFdX",
    );
  });

  it("returns nothing for a different mint", () => {
    expect(extractBurns(dustBatch, "So11111111111111111111111111111111111111112")).toHaveLength(0);
  });

  it("returns nothing when the transaction failed", () => {
    const failed = structuredClone(dustBatch) as { meta: { err: unknown } };
    failed.meta.err = { InstructionError: [0, "Custom"] };
    expect(extractBurns(failed, JTO_MINT)).toHaveLength(0);
  });
});

describe("raw amount arithmetic", () => {
  it("sums beyond MAX_SAFE_INTEGER exactly", () => {
    expect(sumRaw(["9007199254740993", "9007199254740993"])).toBe("18014398509481986");
  });

  it("formats raw base units as JTO without float loss", () => {
    expect(formatRawJto("17577781")).toBe("0.01");
    expect(formatRawJto("13477033588543933", 2)).toBe("13,477,033.58");
    expect(formatRawJto("1000000000000000000", 0)).toBe("1,000,000,000");
  });
});
