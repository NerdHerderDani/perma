import type { RpcCaller } from "../transport";
import { TokenSupplySchema, EpochInfoSchema, type EpochInfo } from "../../schemas";
import { GENESIS_SUPPLY_RAW, JTO_MINT } from "./constants";

export interface SupplyReading {
  supplyRaw: string;
  slot: number;
  fetchedAt: number;
}

export async function fetchSupply(rpc: RpcCaller): Promise<SupplyReading> {
  const res = TokenSupplySchema.parse(await rpc.call("getTokenSupply", [JTO_MINT]));
  return { supplyRaw: res.value.amount, slot: res.context.slot, fetchedAt: Date.now() };
}

export async function fetchEpochInfo(rpc: RpcCaller): Promise<EpochInfo> {
  return EpochInfoSchema.parse(await rpc.call("getEpochInfo", []));
}

/**
 * Genesis supply minus live supply. Exact chain arithmetic — but its meaning
 * as "cumulative burned" rests on the genesis-supply provenance documented in
 * DECODING.md (1B at genesis, mint authority null so supply is burn-only from
 * verification date forward). The methodology tab states this precisely.
 */
export function burnedSinceGenesisRaw(supplyRaw: string): string {
  return (BigInt(GENESIS_SUPPLY_RAW) - BigInt(supplyRaw)).toString();
}
