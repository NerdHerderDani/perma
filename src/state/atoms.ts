import { atom } from "jotai";

/**
 * SECURITY INVARIANT: these atoms are plain in-memory state.
 * No persistence layer (localStorage/IndexedDB/cookies) may ever be attached
 * to rpcUrlAtom. RPC URLs embed API keys; they die with the tab. See SECURITY.md.
 */
export const rpcUrlAtom = atom<string>("");
export const rpcThrottledAtom = atom<boolean>(false);

export type RpcState = "NOT SET" | "LIVE" | "ERROR";
export const rpcStateAtom = atom<RpcState>("NOT SET");
