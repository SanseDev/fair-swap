"use client";

import { useQuery } from "@tanstack/react-query";
import { getSwaps } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { ArrowRightLeft, Activity } from "lucide-react";
import { Swap } from "@/lib/types";

export function RecentActivity() {
  const { data: recentSwaps, isLoading } = useQuery({
    queryKey: ["recentSwaps"],
    queryFn: () => getSwaps({ limit: 5 }),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
                <div className="mt-1 h-2 w-2 rounded-full bg-muted/50 flex-shrink-0" />
                <div className="space-y-2 w-full">
                    <div className="h-4 w-3/4 bg-muted/50 rounded" />
                    <div className="h-3 w-1/2 bg-muted/50 rounded" />
                </div>
            </div>
        ))}
      </div>
    );
  }

  if (!recentSwaps || recentSwaps.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="h-8 w-8 text-muted-foreground/20 mb-2" />
            <p className="text-sm text-muted-foreground">No recent activity found</p>
        </div>
    );
  }

  return (
    <div className="relative space-y-0">
       {/* Timeline Line */}
       <div className="absolute left-[3px] top-2 bottom-2 w-px bg-border/40" />

      {recentSwaps.map((swap: Swap) => (
        <div key={swap.id} className="relative pl-6 py-3 first:pt-0 last:pb-0 group">
          {/* Timeline Dot */}
          <div className="absolute left-0 top-4 h-[7px] w-[7px] rounded-full bg-muted-foreground/30 border border-background group-hover:bg-primary group-hover:scale-125 transition-all duration-300" />
          
          <div className="space-y-1">
             <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <span className="font-mono text-[10px] bg-muted/50 px-1 py-0.5 rounded text-foreground">
                    {swap.seller.slice(0, 4)}
                </span>
                <ArrowRightLeft className="w-3 h-3 text-muted-foreground/50" />
                <span className="font-mono text-[10px] bg-muted/50 px-1 py-0.5 rounded text-foreground">
                    {swap.buyer.slice(0, 4)}
                </span>
             </div>
             
             <p className="text-xs font-medium leading-tight text-foreground/90">
                Swap executed: {Number(swap.token_a_amount).toLocaleString()} <span className="text-muted-foreground">{swap.token_a_mint.slice(0, 3)}..</span> for {Number(swap.token_b_amount).toLocaleString()} <span className="text-muted-foreground">{swap.token_b_mint.slice(0, 3)}..</span>
             </p>

            <p className="text-[10px] text-muted-foreground/60">
              {formatDistanceToNow(new Date(swap.executed_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
