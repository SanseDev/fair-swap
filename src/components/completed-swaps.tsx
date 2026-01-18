"use client";

import { useQuery } from "@tanstack/react-query";
import { getSwaps } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { getTokenLabel, formatTokenAmount } from "@/lib/token-utils";
import { ArrowRightLeft } from "lucide-react";

interface CompletedSwapsProps {
  buyer?: string;
  seller?: string;
  limit?: number;
}

export function CompletedSwaps({ buyer, seller, limit = 10 }: CompletedSwapsProps) {
  const { data: swaps, isLoading } = useQuery({
    queryKey: ["swaps", buyer, seller, limit],
    queryFn: () => getSwaps({ buyer, seller, limit }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 w-full bg-muted/30 rounded border border-border/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!swaps?.length) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border/50 rounded-lg">
        No completed swaps yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {swaps.map((swap) => (
        <div key={swap.id} className="flex items-center justify-between p-3 rounded-md border border-border/40 hover:bg-muted/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <ArrowRightLeft className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <span>{swap.seller.slice(0, 4)}...{swap.seller.slice(-4)}</span>
                <ArrowRightLeft className="h-3 w-3" />
                <span>{swap.buyer.slice(0, 4)}...{swap.buyer.slice(-4)}</span>
              </div>
              <span className="font-medium text-sm">
                {formatTokenAmount(swap.token_a_amount)} {getTokenLabel(swap.token_a_mint)}
                {" ↔ "}
                {formatTokenAmount(swap.token_b_amount)} {getTokenLabel(swap.token_b_mint)}
              </span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(swap.executed_at))} ago
          </div>
        </div>
      ))}
    </div>
  );
}


