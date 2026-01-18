"use client";

import { useWalletSwaps } from "@/hooks/use-wallet-swaps";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { formatDistanceToNow } from "date-fns";
import { getTokenLabel, formatTokenAmount } from "@/lib/token-utils";
import { ArrowRightLeft, ShoppingBag, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function MySwaps() {
  const { isConnected, walletAddress } = useWalletAuth();
  const { swaps, isLoading } = useWalletSwaps();

  if (!isConnected) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border/50 rounded-lg">
        Connect your wallet to view your swap history.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 w-full bg-muted/30 rounded border border-border/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!swaps?.length) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border/50 rounded-lg">
        You haven't participated in any swaps yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {swaps.map((swap) => {
        const isBuyer = swap.buyer === walletAddress;
        const isSeller = swap.seller === walletAddress;
        
        return (
          <div key={swap.id} className="p-4 rounded-lg border border-border/40 hover:bg-muted/20 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <ArrowRightLeft className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Swap Completed</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(swap.executed_at))} ago
                  </span>
                </div>
              </div>
              <Badge variant={isBuyer ? "default" : "secondary"} className="gap-1">
                {isBuyer ? (
                  <>
                    <ShoppingBag className="h-3 w-3" />
                    Buyer
                  </>
                ) : (
                  <>
                    <Store className="h-3 w-3" />
                    Seller
                  </>
                )}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-medium">
                  {isBuyer ? "You Paid" : "You Received"}
                </span>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {formatTokenAmount(isBuyer ? swap.token_b_amount : swap.token_a_amount)}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono truncate">
                    {getTokenLabel(isBuyer ? swap.token_b_mint : swap.token_a_mint)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-medium">
                  {isBuyer ? "You Received" : "You Paid"}
                </span>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {formatTokenAmount(isBuyer ? swap.token_a_amount : swap.token_b_amount)}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono truncate">
                    {getTokenLabel(isBuyer ? swap.token_a_mint : swap.token_b_mint)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{isBuyer ? "Seller" : "Buyer"}:</span>
                <span className="font-mono">
                  {(isBuyer ? swap.seller : swap.buyer).slice(0, 4)}...
                  {(isBuyer ? swap.seller : swap.buyer).slice(-4)}
                </span>
              </div>
              <a
                href={`https://explorer.solana.com/tx/${swap.signature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View on Explorer →
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}


