"use client";

import { useCallback, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PROGRAM_ID, FAIR_SWAP_IDL } from "@/lib/program-config";
import { getOrCreateAssociatedTokenAccount, getTokenBalance } from "@/lib/token-account-utils";
import { Offer } from "@/lib/types";

export function useAcceptOffer() {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptOffer = useCallback(
    async (offer: Offer) => {
      if (!publicKey || !signTransaction || !signAllTransactions) {
        throw new Error("Wallet not connected");
      }

      if (publicKey.toBase58() === offer.seller) {
        throw new Error("Cannot accept your own offer");
      }

      setIsLoading(true);
      setError(null);

      try {
        // Setup provider and program
        const provider = new AnchorProvider(
          connection,
          { publicKey, signTransaction, signAllTransactions },
          { commitment: "confirmed" }
        );
        const program = new Program(FAIR_SWAP_IDL as any, provider);

        // Convert addresses and amounts
        const tokenMintA = new PublicKey(offer.token_mint_a);
        const tokenMintB = new PublicKey(offer.token_mint_b);
        const tokenAmountB = new BN(offer.token_amount_b);
        const seller = new PublicKey(offer.seller);
        const offerId = new BN(offer.offer_id);

        // Derive PDA accounts
        const [offerPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("offer"),
            seller.toBuffer(),
            offerId.toArrayLike(Buffer, "le", 8),
          ],
          PROGRAM_ID
        );

        const [vaultPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("vault"), offerPda.toBuffer()],
          PROGRAM_ID
        );

        // Verify offer account exists on-chain
        const offerAccount = await connection.getAccountInfo(offerPda);
        if (!offerAccount) {
          throw new Error(
            "This offer no longer exists on-chain. It may have been cancelled or completed."
          );
        }

        // Verify the account is owned by the program
        if (!offerAccount.owner.equals(PROGRAM_ID)) {
          throw new Error(
            "Invalid offer account. The account is not owned by the Fair Swap program."
          );
        }

        // Get or create buyer's token B account (what buyer is paying with)
        const { address: buyerTokenAccount, instruction: createBuyerTokenIx, exists: buyerTokenExists } = 
          await getOrCreateAssociatedTokenAccount(
            connection,
            tokenMintB,
            publicKey,
            publicKey
          );

        // Check buyer has enough tokens B
        const buyerBalance = await getTokenBalance(connection, tokenMintB, publicKey);
        const amountNeeded = BigInt(tokenAmountB.toString());
        
        if (buyerBalance < amountNeeded) {
          const readable = Number(buyerBalance) / 1e9;
          const needed = Number(tokenAmountB.toString()) / 1e9;
          throw new Error(
            `Insufficient balance. You have ${readable.toFixed(4)} tokens but need ${needed.toFixed(4)}`
          );
        }

        // Get or create seller's token B account (where seller receives payment)
        const { address: sellerTokenAccount, instruction: createSellerTokenIx } = 
          await getOrCreateAssociatedTokenAccount(
            connection,
            tokenMintB,
            seller,
            publicKey // buyer pays for seller's ATA creation
          );

        // Get or create buyer's token A receive account
        const { address: buyerReceiveAccount, instruction: createBuyerReceiveIx } = 
          await getOrCreateAssociatedTokenAccount(
            connection,
            tokenMintA,
            publicKey,
            publicKey
          );

        // Build transaction
        const txBuilder = program.methods
          .executeSwap()
          .accounts({
            offer: offerPda,
            vault: vaultPda,
            buyerTokenAccount,
            sellerTokenAccount,
            buyerReceiveAccount,
            buyer: publicKey,
            seller,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          });

        // Add pre-instructions to create any missing token accounts
        const preInstructions = [];
        if (createBuyerTokenIx) preInstructions.push(createBuyerTokenIx);
        if (createSellerTokenIx) preInstructions.push(createSellerTokenIx);
        if (createBuyerReceiveIx) preInstructions.push(createBuyerReceiveIx);
        
        if (preInstructions.length > 0) {
          txBuilder.preInstructions(preInstructions);
        }

        // Send transaction
        const tx = await txBuilder.rpc();

        // Wait for confirmation
        await connection.confirmTransaction(tx, "confirmed");

        setIsLoading(false);
        return {
          signature: tx,
          offerPda: offerPda.toBase58(),
        };
      } catch (err: any) {
        console.error("Accept offer error:", err);
        
        let errorMsg = err?.message || "Failed to accept offer";
        
        if (errorMsg.includes("Simulation failed")) {
          errorMsg = "Transaction simulation failed. This usually means:\n" +
                     "1. You don't have enough SOL for transaction fees\n" +
                     "2. You don't have enough of the required tokens\n" +
                     "3. The offer may no longer be available\n\n" +
                     "Original error: " + errorMsg;
        } else if (errorMsg.includes("Transaction was not confirmed")) {
          errorMsg = "Transaction timed out. The network may be congested. Please try again.";
        } else if (errorMsg.includes("User rejected")) {
          errorMsg = "Transaction was cancelled.";
        }
        
        setError(errorMsg);
        setIsLoading(false);
        throw new Error(errorMsg);
      }
    },
    [publicKey, signTransaction, signAllTransactions, connection]
  );

  return {
    acceptOffer,
    isLoading,
    error,
  };
}

