"use client";

import { useQuery } from "@tanstack/react-query";
import { Connection, PublicKey } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";

interface AssetMetadata {
  mint: string;
  name: string;
  symbol: string;
  image?: string;
  decimals: number;
  isNFT: boolean;
}

export function useAssetMetadata(mintAddress: string) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["asset-metadata", mintAddress],
    queryFn: () => fetchAssetMetadata(connection, mintAddress),
    enabled: !!mintAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

async function fetchAssetMetadata(
  connection: Connection,
  mintAddress: string
): Promise<AssetMetadata> {
  try {
    const mintPubkey = new PublicKey(mintAddress);

    // Get mint info to determine decimals
    const mintInfo = await connection.getParsedAccountInfo(mintPubkey);
    
    if (!mintInfo.value || !mintInfo.value.data) {
      throw new Error("Invalid mint account");
    }

    const accountData = mintInfo.value.data;
    
    // Type guard: check if data is ParsedAccountData
    if (Buffer.isBuffer(accountData) || typeof accountData === "string") {
      throw new Error("Account data is not parsed");
    }

    const decimals = accountData.parsed?.info?.decimals || 0;
    const isNFT = decimals === 0;

    // Try to fetch Metaplex metadata
    const metadata = await fetchMetaplexMetadata(connection, mintPubkey);

    if (metadata) {
      // Try to fetch off-chain metadata via proxy
      let offChainData = null;
      if (metadata.uri) {
        try {
          const proxyUrl = `/api/proxy-metadata?uri=${encodeURIComponent(metadata.uri)}`;
          const response = await fetch(proxyUrl);
          if (response.ok) {
            offChainData = await response.json();
          }
        } catch (err) {
        }
      }

      return {
        mint: mintAddress,
        name: metadata.name || (isNFT ? "Unknown NFT" : "Unknown Token"),
        symbol: metadata.symbol || (isNFT ? "NFT" : mintAddress.slice(0, 4)),
        image: offChainData?.image,
        decimals,
        isNFT,
      };
    }

    // Fallback for tokens without metadata
    return {
      mint: mintAddress,
      name: isNFT ? "Unknown NFT" : "Unknown Token",
      symbol: isNFT ? "NFT" : mintAddress.slice(0, 4),
      decimals,
      isNFT,
    };
  } catch (err) {
    console.error("[useAssetMetadata] Error:", err);
    return {
      mint: mintAddress,
      name: "Unknown Asset",
      symbol: mintAddress.slice(0, 4),
      decimals: 0,
      isNFT: false,
    };
  }
}

async function fetchMetaplexMetadata(
  connection: Connection,
  mint: PublicKey
): Promise<{ name: string; symbol: string; uri: string } | null> {
  try {
    const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      METADATA_PROGRAM_ID
    );

    const accountInfo = await connection.getAccountInfo(metadataPDA);
    
    if (!accountInfo || !accountInfo.data) {
      return null;
    }

    const data = accountInfo.data;
    let offset = 1; // Skip key
    offset += 32; // Skip update authority
    offset += 32; // Skip mint

    // Read name
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
    console.error("[fetchMetaplexMetadata] Error:", err);
    return null;
  }
}

