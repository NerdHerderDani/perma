import {
  BurnInstructionSchema,
  ParsedTransactionSchema,
  type ParsedTransaction,
} from "../../schemas";

export interface BurnEvent {
  signature: string;
  slot: number;
  blockTime: number | null;
  /** Raw base units (10^-9 JTO). Kept as bigint-safe string end to end. */
  amountRaw: string;
  authority: string;
  /** The token account the supply was burned from. */
  sourceAccount: string;
}

const SPL_TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

/**
 * Extract every spl-token burn/burnChecked on `mint` from a jsonParsed
 * transaction — top-level and inner instructions both (buyback pipelines
 * typically burn via CPI). Failed transactions yield nothing.
 */
export function extractBurns(tx: unknown, mint: string): BurnEvent[] {
  const parsed: ParsedTransaction = ParsedTransactionSchema.parse(tx);
  if (parsed.meta?.err != null) return [];

  const signature = parsed.transaction.signatures[0];
  if (!signature) return [];

  const all = [
    ...parsed.transaction.message.instructions,
    ...(parsed.meta?.innerInstructions ?? []).flatMap((inner) => inner.instructions),
  ];

  const burns: BurnEvent[] = [];
  for (const ix of all) {
    if (ix.program !== "spl-token" && ix.programId !== SPL_TOKEN_PROGRAM) continue;
    const burn = BurnInstructionSchema.safeParse(ix.parsed);
    if (!burn.success) continue;
    const d = burn.data;
    if (d.info.mint !== mint) continue;
    burns.push({
      signature,
      slot: parsed.slot,
      blockTime: parsed.blockTime,
      amountRaw: d.type === "burn" ? d.info.amount : d.info.tokenAmount.amount,
      authority: d.info.authority,
      sourceAccount: d.info.account,
    });
  }
  return burns;
}

/** Sum raw amounts without float loss. */
export function sumRaw(amounts: readonly string[]): string {
  return amounts.reduce((acc, a) => acc + BigInt(a), 0n).toString();
}

/** Render raw base units as a JTO decimal string (9 decimals), no float math. */
export function formatRawJto(raw: string, fractionDigits = 2): string {
  const v = BigInt(raw);
  const neg = v < 0n;
  const abs = neg ? -v : v;
  const whole = abs / 1_000_000_000n;
  const frac = (abs % 1_000_000_000n).toString().padStart(9, "0").slice(0, fractionDigits);
  const wholeStr = whole.toLocaleString("en-US");
  return `${neg ? "-" : ""}${wholeStr}${fractionDigits > 0 ? `.${frac}` : ""}`;
}
