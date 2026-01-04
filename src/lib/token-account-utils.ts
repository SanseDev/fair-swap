import { Connection, PublicKey } from "@solana/web3.js";
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  getAccount,
  getMint
} from "@solana/spl-token";

export async function checkTokenAccountExists(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey
): Promise<boolean> {
  try {
    const ata = await getAssociatedTokenAddress(mint, owner);
    await getAccount(connection, ata);
    return true;
  } catch {
    return false;
  }
}

export async function getOrCreateAssociatedTokenAccount(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  payer: PublicKey
) {
  const ata = await getAssociatedTokenAddress(mint, owner);
  
  try {
    const account = await getAccount(connection, ata);
    return { address: ata, instruction: null, exists: true };
  } catch {
    // Account doesn't exist, return instruction to create it
    const instruction = createAssociatedTokenAccountInstruction(
      payer,
      ata,
      owner,
      mint
    );
    return { address: ata, instruction, exists: false };
  }
}

export async function getTokenBalance(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey
): Promise<bigint> {
  try {
    const ata = await getAssociatedTokenAddress(mint, owner);
    const account = await getAccount(connection, ata);
    return account.amount;
  } catch {
    return BigInt(0);
  }
}

export async function getTokenDecimals(
  connection: Connection,
  mint: PublicKey
): Promise<number> {
  try {
    const mintInfo = await getMint(connection, mint);
    return mintInfo.decimals;
  } catch {
    // Default to 9 decimals (SOL standard) if we can't fetch
    return 9;
  }
}


