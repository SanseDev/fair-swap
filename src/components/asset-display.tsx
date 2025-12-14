"use client";

import { useAssetMetadata } from "@/hooks/use-asset-metadata";
import { formatTokenAmount } from "@/lib/token-utils";
import { Loader2, Image as ImageIcon, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssetDisplayProps {
  mint: string;
  amount: string;
  className?: string;
  showImage?: boolean;
  imageSize?: "sm" | "md" | "lg";
}

export function AssetDisplay({
  mint,
  amount,
  className,
  showImage = true,
  imageSize = "md",
}: AssetDisplayProps) {
  const { data: metadata, isLoading } = useAssetMetadata(mint);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className={cn("rounded bg-muted flex items-center justify-center", sizeClasses[imageSize])}>
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="h-4 w-20 bg-muted/50 rounded animate-pulse" />
          <div className="h-3 w-32 bg-muted/50 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        {showImage && (
          <div className={cn("rounded bg-muted flex items-center justify-center", sizeClasses[imageSize])}>
            <Coins className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-medium">{formatTokenAmount(amount)} Tokens</span>
          <span className="text-xs text-muted-foreground font-mono truncate">{mint.slice(0, 8)}...</span>
        </div>
      </div>
    );
  }

  const displayAmount = metadata.isNFT
    ? "1 NFT"
    : `${formatTokenAmount(amount, metadata.decimals)} ${metadata.symbol}`;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showImage && (
        <div className={cn("rounded overflow-hidden bg-muted flex-shrink-0 relative", sizeClasses[imageSize])}>
          {metadata.image ? (
            <>
              <img
                src={metadata.image}
                alt={metadata.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div className="hidden w-full h-full absolute inset-0 items-center justify-center bg-muted">
                {metadata.isNFT ? (
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Coins className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {metadata.isNFT ? (
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Coins className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col min-w-0">
        <span className="font-medium truncate">{displayAmount}</span>
        <span className="text-xs text-muted-foreground truncate">{metadata.name}</span>
        {!metadata.isNFT && (
          <span className="text-[10px] text-muted-foreground font-mono truncate">{mint.slice(0, 8)}...</span>
        )}
      </div>
    </div>
  );
}

