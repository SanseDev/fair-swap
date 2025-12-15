"use client";

import { useQuery } from "@tanstack/react-query";
import { getSwaps } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ArrowRightLeft } from "lucide-react";
import { Swap } from "@/lib/types";

export function RecentActivity() {
  const { data: recentSwaps, isLoading } = useQuery({
    queryKey: ["recentSwaps"],
    queryFn: () => getSwaps({ limit: 5 }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted/50 rounded" />
                <div className="h-3 w-24 bg-muted/50 rounded" />
              </div>
              <div className="h-8 w-8 bg-muted/50 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {recentSwaps && recentSwaps.length > 0 ? (
          <div className="space-y-4">
            {recentSwaps.map((swap: Swap) => (
              <div key={swap.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/40 pb-4 last:border-0 last:pb-0">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground truncate">
                      {swap.seller.slice(0, 4)}...{swap.seller.slice(-4)}
                    </span>
                    <ArrowRightLeft className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="font-mono text-xs text-muted-foreground truncate">
                      {swap.buyer.slice(0, 4)}...{swap.buyer.slice(-4)}
                    </span>
                  </div>
                  <div className="text-xs font-medium break-words">
                    Swapped {swap.token_a_amount} <span className="text-muted-foreground">{swap.token_a_mint.slice(0, 4)}...</span> for {swap.token_b_amount} <span className="text-muted-foreground">{swap.token_b_mint.slice(0, 4)}...</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(swap.executed_at), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground py-4">
            No recent activity
          </div>
        )}
      </CardContent>
    </Card>
  );
}

