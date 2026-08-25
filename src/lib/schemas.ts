import { z } from "zod";

/**
 * Zod at every boundary: every RPC response is parsed through one of these
 * before it enters app state. Shapes mirror Solana JSON-RPC `jsonParsed`
 * encoding, captured from real transactions (see src/lib/rpc/jto/__fixtures__).
 */

export const TokenSupplySchema = z.object({
  context: z.object({ slot: z.number() }),
  value: z.object({
    amount: z.string(),
    decimals: z.number(),
    uiAmountString: z.string(),
  }),
});
export type TokenSupply = z.infer<typeof TokenSupplySchema>;

export const EpochInfoSchema = z.object({
  absoluteSlot: z.number(),
  epoch: z.number(),
  slotIndex: z.number(),
  slotsInEpoch: z.number(),
});
export type EpochInfo = z.infer<typeof EpochInfoSchema>;

export const SignatureInfoSchema = z.object({
  signature: z.string(),
  slot: z.number(),
  blockTime: z.number().nullable(),
  err: z.unknown().nullable(),
});
export type SignatureInfo = z.infer<typeof SignatureInfoSchema>;
export const SignaturesSchema = z.array(SignatureInfoSchema);

/** spl-token `burn` instruction, jsonParsed. Amount is a raw base-unit string. */
const BurnParsedSchema = z.object({
  type: z.literal("burn"),
  info: z.object({
    account: z.string(),
    amount: z.string(),
    authority: z.string(),
    mint: z.string(),
  }),
});

/** spl-token `burnChecked` instruction, jsonParsed. */
const BurnCheckedParsedSchema = z.object({
  type: z.literal("burnChecked"),
  info: z.object({
    account: z.string(),
    authority: z.string(),
    mint: z.string(),
    tokenAmount: z.object({
      amount: z.string(),
      decimals: z.number(),
    }),
  }),
});

/** Any instruction: we only care whether it's an spl-token burn on our mint. */
export const ParsedInstructionSchema = z
  .object({
    program: z.string().optional(),
    programId: z.string().optional(),
    parsed: z.unknown().optional(),
  })
  .passthrough();

export const ParsedTransactionSchema = z.object({
  slot: z.number(),
  blockTime: z.number().nullable(),
  meta: z
    .object({
      err: z.unknown().nullable(),
      innerInstructions: z
        .array(z.object({ index: z.number(), instructions: z.array(ParsedInstructionSchema) }))
        .nullable()
        .optional(),
    })
    .nullable(),
  transaction: z.object({
    signatures: z.array(z.string()),
    message: z.object({
      instructions: z.array(ParsedInstructionSchema),
    }),
  }),
});
export type ParsedTransaction = z.infer<typeof ParsedTransactionSchema>;

export const BurnInstructionSchema = z.union([BurnParsedSchema, BurnCheckedParsedSchema]);
export type BurnInstruction = z.infer<typeof BurnInstructionSchema>;
