"use client";

import { useQuery } from "@tanstack/react-query";
import { getOffers } from "@/lib/api";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { formatDistanceToNow } from "date-fns";
import { getTokenLabel, formatTokenAmount } from "@/lib/token-utils";
import { Badge } from "@/components/ui/badge";
import { Store } from "lucide-react";

export function MyOffers() {
  const { isConnected, walletAddress } = useWalletAuth();

  const { data: offers, isLoading } = useQuery({
    queryKey: ["offers", "seller", walletAddress, "active"],
    queryFn: () => walletAddress ? getOffers({ seller: walletAddress, status: 'active' }) : Promise.resolve([]),
    enabled: isConnected && !!walletAddress,
  });

  if (!isConnected) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border/50 rounded-lg">
        Connect your wallet to view your offers.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 w-full bg-muted/30 rounded border border-border/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!offers?.length) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border/50 rounded-lg">
        You don't have any active offers.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {offers.map((offer) => (
        <div key={offer.id} className="p-4 rounded-lg border border-border/40 hover:bg-muted/20 transition-colors">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Store className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Your Offer</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(offer.created_at))} ago
                </span>
              </div>
            </div>
            <Badge variant="default">
              Active
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-medium">
                Selling
              </span>
              <div className="flex flex-col">
                <span className="font-medium">
                  {formatTokenAmount(offer.token_amount_a)}
                </span>
                <span className="text-xs text-muted-foreground font-mono truncate">
                  {getTokenLabel(offer.token_mint_a)}
                </span>
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-medium">
                For
              </span>
              <div className="flex flex-col">
                <span className="font-medium">
                  {formatTokenAmount(offer.token_amount_b)}
                </span>
                <span className="text-xs text-muted-foreground font-mono truncate">
                  {getTokenLabel(offer.token_mint_b)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
            <Badge variant={offer.allow_alternatives ? "secondary" : "outline"} className="text-xs">
              {offer.allow_alternatives ? "Negotiable" : "Fixed Price"}
            </Badge>
            <a
              href={`https://explorer.solana.com/tx/${offer.signature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View on Explorer →
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

