import { PublicKey } from "@solana/web3.js";
import idlJson from "./fair_swap_idl.json";

// Program ID from deployed smart contract on devnet
export const PROGRAM_ID = new PublicKey("DMpk34ArT3Z8nXtZgQXftWhKNq5MAkMcieEFnUQW7oCU");

// IDL for the FairSwap program
export const FAIR_SWAP_IDL = idlJson;

