"use client";

import { useQuery } from "@tanstack/react-query";
import { getSwapStats } from "@/lib/api";

export function SwapStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["swapStats"],
    queryFn: getSwapStats,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2 animate-pulse">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-8 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4 border-b border-border/40">
      <div>
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Volume</div>
        <div className="text-3xl font-light mt-1">
          {stats?.total_volume?.toLocaleString() ?? "0"}
        </div>
      </div>
      <div>
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Swaps</div>
        <div className="text-3xl font-light mt-1">
          {stats?.total_swaps?.toLocaleString() ?? "0"}
        </div>
      </div>
      <div>
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Offers</div>
        <div className="text-3xl font-light mt-1">
          {stats?.active_offers?.toLocaleString() ?? "0"}
        </div>
      </div>
    </div>
  );
}
