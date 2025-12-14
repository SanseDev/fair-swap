"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export interface WalletToken {
  mint: string;
  balance: number;
  decimals: number;
  symbol?: string;
  name?: string;
  logoURI?: string;
  uiAmount: string;
}

// Suggested tokens with metadata
export const SUGGESTED_TOKENS = [
  {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  },
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  },
  {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    name: "USDT",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg",
  },
  {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png",
  },
];

export function useWalletTokens() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [tokens, setTokens] = useState<WalletToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletTokens = useCallback(async () => {
    if (!publicKey) {
      setTokens([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const walletTokens: WalletToken[] = [];

      // Fetch SOL balance
      const solBalance = await connection.getBalance(publicKey);
      if (solBalance > 0) {
        walletTokens.push({
          mint: "So11111111111111111111111111111111111111112",
          balance: solBalance,
          decimals: 9,
          symbol: "SOL",
          name: "Solana",
          logoURI: SUGGESTED_TOKENS[0].logoURI,
          uiAmount: (solBalance / Math.pow(10, 9)).toFixed(4),
        });
      }

      // Fetch SPL tokens using getParsedTokenAccountsByOwner
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      // Process each token account
      for (const { account } of tokenAccounts.value) {
        const parsedInfo = account.data.parsed.info;
        const mintAddress = parsedInfo.mint;
        const balance = parsedInfo.tokenAmount.amount;
        const decimals = parsedInfo.tokenAmount.decimals;
        const uiAmount = parsedInfo.tokenAmount.uiAmountString;

        // Only include tokens with positive balance
        if (parseFloat(balance) > 0) {
          // Try to get metadata from suggested tokens
          const suggestedToken = SUGGESTED_TOKENS.find((t) => t.mint === mintAddress);

          walletTokens.push({
            mint: mintAddress,
            balance: parseFloat(balance),
            decimals,
            symbol: suggestedToken?.symbol || mintAddress.slice(0, 4),
            name: suggestedToken?.name || "Unknown Token",
            logoURI: suggestedToken?.logoURI,
            uiAmount: uiAmount || (parseFloat(balance) / Math.pow(10, decimals)).toFixed(decimals),
          });
        }
      }

      setTokens(walletTokens);
    } catch (err: any) {
      console.error("[useWalletTokens] Error fetching tokens:", err);
      setError(err.message || "Failed to fetch wallet tokens");
    } finally {
      setIsLoading(false);
    }
  }, [connection, publicKey]);

  // Fetch tokens when wallet connects
  useEffect(() => {
    fetchWalletTokens();
  }, [fetchWalletTokens]);

  // Validate custom token mint on-chain
  const validateCustomToken = useCallback(
    async (mintAddress: string): Promise<WalletToken | null> => {
      try {
        const mintPubkey = new PublicKey(mintAddress);
        const mintInfo = await getMint(connection, mintPubkey);

        // Check if suggested token
        const suggestedToken = SUGGESTED_TOKENS.find((t) => t.mint === mintAddress);

        return {
          mint: mintAddress,
          balance: 0,
          decimals: mintInfo.decimals,
          symbol: suggestedToken?.symbol || mintAddress.slice(0, 4),
          name: suggestedToken?.name || "Custom Token",
          logoURI: suggestedToken?.logoURI,
          uiAmount: "0",
        };
      } catch (err) {
        console.error("[useWalletTokens] Invalid mint address:", err);
        return null;
      }
    },
    [connection]
  );

  return {
    tokens,
    isLoading,
    error,
    refetch: fetchWalletTokens,
    validateCustomToken,
  };
}

