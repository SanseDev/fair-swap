"use client";

import { useQuery } from "@tanstack/react-query";
import { getSwaps, getProposals } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { getTokenLabel, formatTokenAmount } from "@/lib/token-utils";
import { ArrowRightLeft } from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'swap' | 'proposal';
  timestamp: Date;
  data: any;
}

interface RecentActivityProps {
  limit?: number;
}

export function RecentActivity({ limit = 15 }: RecentActivityProps) {
  const { data: swaps, isLoading: swapsLoading } = useQuery({
    queryKey: ["swaps", "recent", limit],
    queryFn: () => getSwaps({ limit }),
  });

  const { data: proposals, isLoading: proposalsLoading } = useQuery({
    queryKey: ["proposals", "recent"],
    queryFn: () => getProposals(),
  });

  const isLoading = swapsLoading || proposalsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 w-full bg-muted/30 rounded border border-border/40 animate-pulse" />
        ))}
      </div>
    );
  }

  // Combine and sort activities by timestamp
  const activities: ActivityItem[] = [
    ...(swaps || []).map(swap => ({
      id: swap.id,
      type: 'swap' as const,
      timestamp: new Date(swap.executed_at),
      data: swap,
    })),
    ...(proposals || []).map(proposal => ({
      id: proposal.id,
      type: 'proposal' as const,
      timestamp: new Date(proposal.created_at),
      data: proposal,
    })),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);

  if (!activities.length) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border/50 rounded-lg">
        No recent activity.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        if (activity.type === 'swap') {
          const swap = activity.data;
          return (
            <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-md border border-border/40 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground flex-wrap">
                    <span className="truncate">{swap.seller.slice(0, 4)}...{swap.seller.slice(-4)}</span>
                    <ArrowRightLeft className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{swap.buyer.slice(0, 4)}...{swap.buyer.slice(-4)}</span>
                  </div>
                  <span className="font-medium text-sm break-words">
                    Swapped {formatTokenAmount(swap.token_a_amount)} {getTokenLabel(swap.token_a_mint)}
                    {" ↔ "}
                    {formatTokenAmount(swap.token_b_amount)} {getTokenLabel(swap.token_b_mint)}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap self-start sm:self-center">
                {formatDistanceToNow(activity.timestamp)} ago
              </div>
            </div>
          );
        } else {
          const proposal = activity.data;
          return (
            <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-md border border-border/40 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  proposal.status === 'accepted' ? 'bg-green-500' : 
                  proposal.status === 'withdrawn' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <div className="flex flex-col min-w-0">
                  <span className="font-mono text-xs text-muted-foreground truncate">
                    {proposal.buyer.slice(0, 4)}...{proposal.buyer.slice(-4)}
                  </span>
                  <span className="font-medium text-sm break-words">
                    {proposal.status === 'pending' ? 'Proposed' : 
                     proposal.status === 'accepted' ? 'Accepted' : 'Withdrew'} 
                    {' '}{formatTokenAmount(proposal.proposed_amount)} {getTokenLabel(proposal.proposed_mint)}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap self-start sm:self-center">
                {formatDistanceToNow(activity.timestamp)} ago
              </div>
            </div>
          );
        }
      })}
    </div>
  );
}

