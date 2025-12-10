"use client";

import { useQuery } from "@tanstack/react-query";
import { getProposals } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface ProposalHistoryProps {
  offerId?: string;
  buyer?: string;
}

export function ProposalHistory({ offerId, buyer }: ProposalHistoryProps) {
  const { data: proposals, isLoading } = useQuery({
    queryKey: ["proposals", offerId, buyer],
    queryFn: () => getProposals(offerId, { buyer }),
  });

  if (isLoading) {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-full bg-muted/30 rounded border border-border/40 animate-pulse" />
            ))}
        </div>
    );
  }

  if (!proposals?.length) {
    return (
        <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border/50 rounded-lg">
            No recent activity.
        </div>
    );
  }

  return (
    <div className="space-y-3">
        {proposals.map((proposal) => (
            <div key={proposal.id} className="flex items-center justify-between p-3 rounded-md border border-border/40 hover:bg-muted/20 transition-colors text-sm">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                        proposal.status === 'accepted' ? 'bg-green-500/50' : 
                        proposal.status === 'withdrawn' ? 'bg-red-500/50' : 'bg-yellow-500/50'
                    }`} />
                    <div className="flex flex-col">
                        <span className="font-mono text-xs text-muted-foreground">{proposal.buyer.slice(0, 4)}...{proposal.buyer.slice(-4)}</span>
                        <span className="font-medium">
                            {proposal.status === 'pending' ? 'Proposed' : 
                             proposal.status === 'accepted' ? 'Swapped' : 'Withdrew'} 
                            {' '}{proposal.proposed_amount} tokens
                        </span>
                    </div>
                </div>
                <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(proposal.created_at))} ago
                </div>
            </div>
        ))}
    </div>
  );
}
