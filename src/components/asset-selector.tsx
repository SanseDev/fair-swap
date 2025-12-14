"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TokenSelector } from "@/components/token-selector";
import { NFTSelector } from "@/components/nft-selector";
import { WalletToken } from "@/hooks/use-wallet-tokens";
import { WalletNFT } from "@/hooks/use-wallet-nfts";
import { Coins, Image } from "lucide-react";

export type AssetType = "token" | "nft";

export interface SelectedAsset {
  type: AssetType;
  mint: string;
  data?: WalletToken | WalletNFT;
  amount?: string;
  decimals?: number;
}

interface AssetSelectorProps {
  value?: SelectedAsset;
  onChange: (asset: SelectedAsset) => void;
  label?: string;
  excludeMint?: string;
}

export function AssetSelector({ value, onChange, label = "Select Asset", excludeMint }: AssetSelectorProps) {
  const [assetType, setAssetType] = useState<AssetType>(value?.type || "token");

  const handleTokenChange = (mint: string, token?: WalletToken) => {
    onChange({
      type: "token",
      mint,
      data: token,
      decimals: token?.decimals || 9,
    });
  };

  const handleNFTChange = (mint: string, nft?: WalletNFT) => {
    onChange({
      type: "nft",
      mint,
      data: nft,
      amount: "1",
      decimals: 0,
    });
  };

  return (
    <Tabs value={assetType} onValueChange={(v) => setAssetType(v as AssetType)} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="token" className="flex items-center gap-2">
          <Coins className="w-4 h-4" />
          Tokens
        </TabsTrigger>
        <TabsTrigger value="nft" className="flex items-center gap-2">
          <Image className="w-4 h-4" />
          NFTs
        </TabsTrigger>
      </TabsList>

      <TabsContent value="token" className="mt-3">
        <TokenSelector
          value={value?.type === "token" ? value.mint : undefined}
          onChange={handleTokenChange}
          label={label}
          excludeMint={excludeMint}
        />
      </TabsContent>

      <TabsContent value="nft" className="mt-3">
        <NFTSelector
          value={value?.type === "nft" ? value.mint : undefined}
          onChange={handleNFTChange}
          label={label}
          excludeMint={excludeMint}
        />
      </TabsContent>
    </Tabs>
  );
}

