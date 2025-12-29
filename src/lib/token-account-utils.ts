import { Connection, PublicKey } from "@solana/web3.js";
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  getAccount
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



