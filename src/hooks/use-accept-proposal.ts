"use client";

import { useCallback, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PROGRAM_ID, FAIR_SWAP_IDL } from "@/lib/program-config";
import { getOrCreateAssociatedTokenAccount } from "@/lib/token-account-utils";
import { Offer, Proposal } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";

interface AcceptProposalParams {
  proposal: Proposal;
  offer: Offer;
}

export function useAcceptProposal() {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const acceptProposal = useCallback(
    async (params: AcceptProposalParams) => {
      if (!publicKey || !signTransaction || !signAllTransactions) {
        throw new Error("Wallet not connected");
      }

      if (publicKey.toBase58() !== params.offer.seller) {
        throw new Error("Only the seller can accept proposals");
      }

      setIsLoading(true);

      try {
        const provider = new AnchorProvider(
          connection,
          { publicKey, signTransaction, signAllTransactions },
          { commitment: "confirmed" }
        );

        const program = new Program(FAIR_SWAP_IDL as any, provider);

        const { offer, proposal } = params;
        const tokenMintA = new PublicKey(offer.token_mint_a);
        const proposedMint = new PublicKey(proposal.proposed_mint);
        const seller = new PublicKey(offer.seller);
        const buyer = new PublicKey(proposal.buyer);
        const offerId = new BN(offer.offer_id);
        const proposalId = new BN(proposal.proposal_id);

        // Derive the offer PDA
        const [offerPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("offer"),
            seller.toBuffer(),
            offerId.toArrayLike(Buffer, "le", 8),
          ],
          PROGRAM_ID
        );

        // Derive the proposal PDA
        const [proposalPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("proposal"), 
            offerPda.toBuffer(), 
            buyer.toBuffer(),
            proposalId.toArrayLike(Buffer, "le", 8)
          ],
          PROGRAM_ID
        );

        // Derive vault PDAs
        const [offerVaultPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("vault"), offerPda.toBuffer()],
          PROGRAM_ID
        );

        const [proposalVaultPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("vault"), proposalPda.toBuffer()],
          PROGRAM_ID
        );

        // Verify offer account exists on-chain
        const offerAccount = await connection.getAccountInfo(offerPda);
        if (!offerAccount) {
          throw new Error(
            "This offer no longer exists on-chain. It may have been cancelled or completed."
          );
        }

        // Verify proposal account exists on-chain
        const proposalAccount = await connection.getAccountInfo(proposalPda);
        if (!proposalAccount) {
          throw new Error(
            "This proposal no longer exists on-chain. It may have been withdrawn or already accepted."
          );
        }

        // Get or create seller's receive account for proposed tokens
        const { address: sellerReceiveAccount, instruction: createSellerReceiveIx } = 
          await getOrCreateAssociatedTokenAccount(
            connection,
            proposedMint,
            publicKey,
            publicKey
          );

        // Get or create buyer's receive account for offered tokens
        const { address: buyerReceiveAccount, instruction: createBuyerReceiveIx } = 
          await getOrCreateAssociatedTokenAccount(
            connection,
            tokenMintA,
            buyer,
            publicKey // seller pays for buyer's ATA creation
          );

        // Build transaction
        const txBuilder = program.methods
          .acceptProposal()
          .accounts({
            offer: offerPda,
            proposal: proposalPda,
            offerVault: offerVaultPda,
            proposalVault: proposalVaultPda,
            sellerReceiveAccount,
            buyerReceiveAccount,
            seller: publicKey,
            buyerAccount: buyer,
            tokenProgram: TOKEN_PROGRAM_ID,
          });

        // Add pre-instructions to create any missing token accounts
        const preInstructions = [];
        if (createSellerReceiveIx) preInstructions.push(createSellerReceiveIx);
        if (createBuyerReceiveIx) preInstructions.push(createBuyerReceiveIx);
        
        if (preInstructions.length > 0) {
          txBuilder.preInstructions(preInstructions);
        }

        // Send transaction
        const tx = await txBuilder.rpc();

        // Wait for confirmation
        await connection.confirmTransaction(tx, "confirmed");

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["proposals"] });
        queryClient.invalidateQueries({ queryKey: ["offers"] });
        queryClient.invalidateQueries({ queryKey: ["swaps"] });

        setIsLoading(false);
        return {
          signature: tx,
        };
      } catch (err: any) {
        console.error("Accept proposal error:", err);
        
        let errorMsg = err?.message || "Failed to accept proposal";
        
        if (errorMsg.includes("Simulation failed")) {
          errorMsg = "Transaction simulation failed. The proposal may no longer be available.";
        }
        
        setIsLoading(false);
        throw new Error(errorMsg);
      }
    },
    [publicKey, signTransaction, signAllTransactions, connection, queryClient]
  );

  return {
    acceptProposal,
    isLoading,
  };
}

