"use client";

import { useCallback, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createSyncNativeInstruction, NATIVE_MINT } from "@solana/spl-token";
import { PROGRAM_ID, FAIR_SWAP_IDL } from "@/lib/program-config";
import { getOrCreateAssociatedTokenAccount, getTokenBalance, getTokenDecimals } from "@/lib/token-account-utils";

export interface CreateOfferParams {
  tokenMintA: string;
  tokenAmountA: string;
  tokenMintB: string;
  tokenAmountB: string;
  allowAlternatives: boolean;
}

export function useCreateOffer() {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOffer = useCallback(
    async (params: CreateOfferParams) => {
      if (!publicKey || !signTransaction || !signAllTransactions) {
        throw new Error("Wallet not connected");
      }

      setIsLoading(true);
      setError(null);

      try {
        // Check if program exists on current network
        const programInfo = await connection.getAccountInfo(PROGRAM_ID);
        if (!programInfo) {
          throw new Error(
            `Program not found at ${PROGRAM_ID.toBase58()}. Make sure you're connected to the correct network (devnet/mainnet) and the program is deployed.`
          );
        }

        // Setup provider and program
        const provider = new AnchorProvider(
          connection,
          { publicKey, signTransaction, signAllTransactions },
          { commitment: "confirmed" }
        );
        const program = new Program(FAIR_SWAP_IDL as any, provider);

        // Generate unique offer ID (timestamp + random)
        const offerId = new BN(Date.now() * 1000 + Math.floor(Math.random() * 1000));

        // Convert addresses and amounts
        const tokenMintA = new PublicKey(params.tokenMintA);
        const tokenMintB = new PublicKey(params.tokenMintB);
        const tokenAmountA = new BN(params.tokenAmountA);
        const tokenAmountB = new BN(params.tokenAmountB);

        // Derive PDA accounts
        const [offerPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("offer"),
            publicKey.toBuffer(),
            offerId.toArrayLike(Buffer, "le", 8),
          ],
          PROGRAM_ID
        );

        const [vaultPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("vault"), offerPda.toBuffer()],
          PROGRAM_ID
        );

        // Check if token mint exists
        const mintInfo = await connection.getAccountInfo(tokenMintA);
        if (!mintInfo) {
          throw new Error(
            `Token mint ${tokenMintA.toBase58()} not found. Make sure this is a valid SPL token on the current network.`
          );
        }

        // Get or create token account
        const { address: sellerTokenAccount, instruction: createAtaIx, exists } = 
          await getOrCreateAssociatedTokenAccount(
            connection,
            tokenMintA,
            publicKey,
            publicKey
          );

        // Check token balance (handle native SOL vs SPL tokens)
        const NATIVE_SOL_MINT = "So11111111111111111111111111111111111111112";
        let balance: bigint;
        
        if (tokenMintA.toBase58() === NATIVE_SOL_MINT) {
          // For native SOL, check wallet balance directly
          const solBalance = await connection.getBalance(publicKey);
          balance = BigInt(solBalance);
        } else {
          // For SPL tokens, check token account balance
          balance = await getTokenBalance(connection, tokenMintA, publicKey);
        }
        
        if (balance === BigInt(0)) {
          throw new Error(
            `You have 0 tokens in your account for ${tokenMintA.toBase58()}. Please add tokens to your wallet first.`
          );
        }
        
        // Convert BN to BigInt for comparison
        const amountNeeded = BigInt(tokenAmountA.toString());
        if (balance < amountNeeded) {
          // Get actual token decimals for accurate display
          const decimals = await getTokenDecimals(connection, tokenMintA);
          const divisor = Math.pow(10, decimals);
          const readable = Number(balance) / divisor;
          const needed = Number(tokenAmountA.toString()) / divisor;
          throw new Error(
            `Insufficient balance. You have ${readable.toFixed(4)} tokens but need ${needed.toFixed(4)}`
          );
        }

        // Prepare pre-instructions for SOL wrapping if needed
        const preInstructions: TransactionInstruction[] = [];
        
        // If token account doesn't exist, add instruction to create it
        if (!exists && createAtaIx) {
          preInstructions.push(createAtaIx);
        }

        // If offering native SOL, wrap it into wSOL token account
        if (tokenMintA.toBase58() === NATIVE_SOL_MINT) {
          // Transfer SOL to wSOL account
          preInstructions.push(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: sellerTokenAccount,
              lamports: Number(tokenAmountA.toString()),
            })
          );
          
          // Sync native (converts SOL to wSOL)
          preInstructions.push(
            createSyncNativeInstruction(sellerTokenAccount)
          );
        }

        // Build transaction
        const txBuilder = program.methods
          .initializeOffer(
            offerId,
            tokenAmountA,
            tokenMintB,
            tokenAmountB,
            params.allowAlternatives
          )
          .accounts({
            offer: offerPda,
            vault: vaultPda,
            sellerTokenAccount,
            tokenMintA,
            seller: publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          });

        // Add all pre-instructions if any
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
          offerId: offerId.toString(),
          offerPda: offerPda.toBase58(),
        };
      } catch (err: any) {
        console.error("Create offer error:", err);
        
        // Parse Anchor/Solana errors for better messages
        let errorMsg = err?.message || "Failed to create offer";
        
        if (errorMsg.includes("Simulation failed")) {
          errorMsg = "Transaction simulation failed. This usually means:\n" +
                     "1. You don't have enough SOL for transaction fees\n" +
                     "2. The token account doesn't exist\n" +
                     "3. You don't have the tokens you're trying to send\n\n" +
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
    createOffer,
    isLoading,
    error,
  };
}
