"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export interface NFTMetadata {
  name: string;
  symbol: string;
  uri: string;
  image?: string;
  description?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
  collection?: {
    name: string;
    family: string;
  };
}

export interface WalletNFT {
  mint: string;
  name: string;
  symbol: string;
  image?: string;
  uri: string;
  metadata?: NFTMetadata;
  tokenAccount: string;
}

export function useWalletNFTs() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [nfts, setNfts] = useState<WalletNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNFTMetadata = async (uri: string): Promise<NFTMetadata | null> => {
    try {
      // Use proxy to bypass CORS
      const proxyUrl = `/api/proxy-metadata?uri=${encodeURIComponent(uri)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) return null;
      const metadata = await response.json();
      return metadata;
    } catch (err) {
      // Silently fail for missing/broken metadata
      return null;
    }
  };

  const fetchWalletNFTs = useCallback(async () => {
    if (!publicKey) {
      setNfts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const walletNFTs: WalletNFT[] = [];

      // Fetch all token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });

      console.log("[useWalletNFTs] Total token accounts:", tokenAccounts.value.length);

      // Filter for NFTs (decimals = 0, amount >= 1)
      const nftAccounts = tokenAccounts.value.filter((item) => {
        try {
          // Check if data is parsed - correct path is item.account.data
          if (!item.account?.data?.parsed?.info) {
            return false;
          }
          
          const parsedInfo = item.account.data.parsed.info;
          const tokenAmount = parsedInfo.tokenAmount;
          
          if (!tokenAmount) {
            return false;
          }
          
          const amount = tokenAmount.amount;
          const decimals = tokenAmount.decimals;
          const uiAmount = tokenAmount.uiAmount;
          
          // NFTs: decimals = 0 and at least 1 in balance
          const isNFT = decimals === 0 && (amount === "1" || uiAmount === 1 || parseInt(amount) >= 1);
          
          if (isNFT) {
            console.log("[useWalletNFTs] ✅ Found NFT candidate:", {
              mint: parsedInfo.mint,
              amount,
              decimals,
              uiAmount
            });
          }
          
          return isNFT;
        } catch (err) {
          console.error("[useWalletNFTs] Error filtering NFT:", err);
          return false;
        }
      });

      console.log("[useWalletNFTs] NFT accounts found:", nftAccounts.length);

      // Fetch metadata for each NFT
      for (const item of nftAccounts) {
        try {
          // Safety check for parsed data
          if (!item.account?.data?.parsed?.info) {
            console.warn("[useWalletNFTs] Skipping account with unparsed data");
            continue;
          }
          
          const parsedInfo = item.account.data.parsed.info;
          const mintAddress = parsedInfo.mint;
          const tokenAccount = item.pubkey.toBase58();

          // Derive metadata PDA (Metaplex standard)
          const metadataPDA = await getMetadataPDA(new PublicKey(mintAddress));
          console.log("[useWalletNFTs] Checking metadata for:", mintAddress, "PDA:", metadataPDA.toBase58());
          
          // Fetch on-chain metadata account
          const accountInfo = await connection.getAccountInfo(metadataPDA);
          
          if (accountInfo && accountInfo.data) {
            console.log("[useWalletNFTs] Metadata account found, decoding...");
            const metadata = decodeMetadata(accountInfo.data);
            
            if (metadata) {
              console.log("[useWalletNFTs] Decoded metadata:", metadata);
              // Fetch off-chain metadata (JSON)
              const offChainMetadata = metadata.uri ? await fetchNFTMetadata(metadata.uri) : null;

              walletNFTs.push({
                mint: mintAddress,
                name: metadata.name || "Unknown NFT",
                symbol: metadata.symbol || "NFT",
                image: offChainMetadata?.image || undefined,
                uri: metadata.uri || "",
                metadata: offChainMetadata || undefined,
                tokenAccount,
              });
              console.log("[useWalletNFTs] ✅ Added NFT:", metadata.name);
            } else {
              console.warn("[useWalletNFTs] Failed to decode metadata for:", mintAddress);
            }
          } else {
            console.warn("[useWalletNFTs] No metadata account found for:", mintAddress);
            // Fallback for NFTs without metadata - still add them!
            walletNFTs.push({
              mint: mintAddress,
              name: `NFT ${mintAddress.slice(0, 8)}...`,
              symbol: "NFT",
              uri: "",
              tokenAccount,
            });
            console.log("[useWalletNFTs] ✅ Added NFT without metadata:", mintAddress);
          }
        } catch (err) {
          console.error("[useWalletNFTs] Error processing NFT:", err);
        }
      }

      setNfts(walletNFTs);
    } catch (err: any) {
      console.error("[useWalletNFTs] Error fetching NFTs:", err);
      setError(err.message || "Failed to fetch NFTs");
    } finally {
      setIsLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    fetchWalletNFTs();
  }, [fetchWalletNFTs]);

  return {
    nfts,
    isLoading,
    error,
    refetch: fetchWalletNFTs,
  };
}

// Metaplex metadata PDA derivation
async function getMetadataPDA(mint: PublicKey): Promise<PublicKey> {
  const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM_ID
  );
  return metadataPDA;
}

// Simplified metadata decoder (Metaplex Token Metadata format)
function decodeMetadata(data: Buffer): { name: string; symbol: string; uri: string } | null {
  try {
    // Metaplex metadata structure (simplified)
    // Skip first byte (key), then read strings
    let offset = 1; // Skip key
    offset += 32; // Skip update authority
    offset += 32; // Skip mint

    // Read name (first 4 bytes = length, then string)
    const nameLength = data.readUInt32LE(offset);
    offset += 4;
    const name = data.slice(offset, offset + nameLength).toString("utf8").replace(/\0/g, "").trim();
    offset += nameLength;

    // Read symbol
    const symbolLength = data.readUInt32LE(offset);
    offset += 4;
    const symbol = data.slice(offset, offset + symbolLength).toString("utf8").replace(/\0/g, "").trim();
    offset += symbolLength;

    // Read URI
    const uriLength = data.readUInt32LE(offset);
    offset += 4;
    const uri = data.slice(offset, offset + uriLength).toString("utf8").replace(/\0/g, "").trim();

    return { name, symbol, uri };
  } catch (err) {
    console.error("[decodeMetadata] Failed to decode:", err);
    return null;
  }
}

