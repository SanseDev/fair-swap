import { Connection, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { PROGRAM_ID } from "./program-config";

/**
 * Verify if an offer account exists on-chain
 */
export async function verifyOfferExists(
  connection: Connection,
  seller: string,
  offerId: string
): Promise<boolean> {
  try {
    const sellerPubkey = new PublicKey(seller);
    const offerIdBN = new BN(offerId);
    
    const [offerPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("offer"),
        sellerPubkey.toBuffer(),
        offerIdBN.toArrayLike(Buffer, "le", 8),
      ],
      PROGRAM_ID
    );

    const accountInfo = await connection.getAccountInfo(offerPda);
    return accountInfo !== null && accountInfo.owner.equals(PROGRAM_ID);
  } catch {
    return false;
  }
}

/**
 * Verify if a proposal account exists on-chain
 */
export async function verifyProposalExists(
  connection: Connection,
  offerPda: string,
  buyer: string,
  proposalId: string
): Promise<boolean> {
  try {
    const offerPubkey = new PublicKey(offerPda);
    const buyerPubkey = new PublicKey(buyer);
    const proposalIdBN = new BN(proposalId);
    
    const [proposalPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("proposal"),
        offerPubkey.toBuffer(),
        buyerPubkey.toBuffer(),
        proposalIdBN.toArrayLike(Buffer, "le", 8),
      ],
      PROGRAM_ID
    );

    const accountInfo = await connection.getAccountInfo(proposalPda);
    return accountInfo !== null && accountInfo.owner.equals(PROGRAM_ID);
  } catch {
    return false;
  }
}

/**
 * Get offer PDA address
 */
export function getOfferPda(seller: string, offerId: string): PublicKey {
  const sellerPubkey = new PublicKey(seller);
  const offerIdBN = new BN(offerId);
  
  const [offerPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("offer"),
      sellerPubkey.toBuffer(),
      offerIdBN.toArrayLike(Buffer, "le", 8),
    ],
    PROGRAM_ID
  );

  return offerPda;
}

/**
 * Get proposal PDA address
 */
export function getProposalPda(
  seller: string,
  offerId: string,
  buyer: string,
  proposalId: string
): PublicKey {
  const offerPda = getOfferPda(seller, offerId);
  const buyerPubkey = new PublicKey(buyer);
  const proposalIdBN = new BN(proposalId);
  
  const [proposalPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("proposal"),
      offerPda.toBuffer(),
      buyerPubkey.toBuffer(),
      proposalIdBN.toArrayLike(Buffer, "le", 8),
    ],
    PROGRAM_ID
  );

  return proposalPda;
}


