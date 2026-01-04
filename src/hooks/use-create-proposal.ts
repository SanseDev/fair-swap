"use client";

import { useCallback, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PROGRAM_ID, FAIR_SWAP_IDL } from "@/lib/program-config";
import { getOrCreateAssociatedTokenAccount, getTokenBalance, getTokenDecimals } from "@/lib/token-account-utils";
import { Offer } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";

interface CreateProposalParams {
  offer: Offer;
  proposedMint: string;
  proposedAmount: string;
}

export function useCreateProposal() {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const createProposal = useCallback(
    async (params: CreateProposalParams) => {
      if (!publicKey || !signTransaction || !signAllTransactions) {
        throw new Error("Wallet not connected");
      }

      if (publicKey.toBase58() === params.offer.seller) {
        throw new Error("Cannot propose on your own offer");
      }

      setIsLoading(true);

      try {
        const provider = new AnchorProvider(
          connection,
          { publicKey, signTransaction, signAllTransactions },
          { commitment: "confirmed" }
        );

        const program = new Program(FAIR_SWAP_IDL as any, provider);

        // Generate a unique ID for the proposal
        const proposalId = new BN(Date.now() * 1000 + Math.floor(Math.random() * 1000));
        
        const proposedMint = new PublicKey(params.proposedMint);
        const proposedAmount = new BN(params.proposedAmount);
        const seller = new PublicKey(params.offer.seller);
        const offerId = new BN(params.offer.offer_id);

        // Derive the offer PDA
        const [offerPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("offer"),
            seller.toBuffer(),
            offerId.toArrayLike(Buffer, "le", 8),
          ],
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

        // Derive the proposal PDA
        const [proposalPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("proposal"), 
            offerPda.toBuffer(), 
            publicKey.toBuffer(),
            proposalId.toArrayLike(Buffer, "le", 8)
          ],
          PROGRAM_ID
        );

        // Derive proposal vault PDA
        const [proposalVaultPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("vault"), proposalPda.toBuffer()],
          PROGRAM_ID
        );

        // Get or create buyer's token account for proposed mint
        const { address: buyerTokenAccount, instruction: createBuyerTokenIx } = 
          await getOrCreateAssociatedTokenAccount(
            connection,
            proposedMint,
            publicKey,
            publicKey
          );

        // Check buyer has enough tokens
        const buyerBalance = await getTokenBalance(connection, proposedMint, publicKey);
        const amountNeeded = BigInt(proposedAmount.toString());
        
        if (buyerBalance < amountNeeded) {
          // Get actual token decimals for accurate display
          const decimals = await getTokenDecimals(connection, proposedMint);
          const divisor = Math.pow(10, decimals);
          const readable = Number(buyerBalance) / divisor;
          const needed = Number(proposedAmount.toString()) / divisor;
          throw new Error(
            `Insufficient balance. You have ${readable.toFixed(4)} tokens but need ${needed.toFixed(4)}`
          );
        }

        // Build transaction
        const txBuilder = program.methods
          .submitProposal(proposalId, proposedAmount)
          .accounts({
            offer: offerPda,
            proposal: proposalPda,
            proposalVault: proposalVaultPda,
            buyerTokenAccount,
            proposedMint,
            buyer: publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          });

        // Add pre-instruction if token account needs to be created
        if (createBuyerTokenIx) {
          txBuilder.preInstructions([createBuyerTokenIx]);
        }

        // Send transaction
        const tx = await txBuilder.rpc();

        // Wait for confirmation
        await connection.confirmTransaction(tx, "confirmed");

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["proposals"] });

        setIsLoading(false);
        return {
          signature: tx,
          proposalId: proposalId.toString(),
          proposalPda: proposalPda.toBase58(),
        };
      } catch (err: any) {
        console.error("Create proposal error:", err);
        
        let errorMsg = err?.message || "Failed to create proposal";
        
        if (errorMsg.includes("Simulation failed")) {
          errorMsg = "Transaction simulation failed. Check your balance and try again.";
        }
        
        setIsLoading(false);
        throw new Error(errorMsg);
      }
    },
    [publicKey, signTransaction, signAllTransactions, connection, queryClient]
  );

  return {
    createProposal,
    isLoading,
  };
}

