"use client";

import { useQuery } from "@tanstack/react-query";
import { getProposals } from "@/lib/api";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { formatDistanceToNow } from "date-fns";
import { getTokenLabel, formatTokenAmount } from "@/lib/token-utils";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";

export function MyProposals() {
  const { isConnected, walletAddress } = useWalletAuth();

  const { data: proposals, isLoading } = useQuery({
    queryKey: ["proposals", "buyer", walletAddress],
    queryFn: () => walletAddress ? getProposals(undefined, { buyer: walletAddress }) : Promise.resolve([]),
    enabled: isConnected && !!walletAddress,
  });

  if (!isConnected) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border/50 rounded-lg">
        Connect your wallet to view your proposals.
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

  if (!proposals?.length) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border/50 rounded-lg">
        You haven't made any proposals yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {proposals.map((proposal) => (
        <div key={proposal.id} className="p-4 rounded-lg border border-border/40 hover:bg-muted/20 transition-colors">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Your Proposal</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(proposal.created_at))} ago
                </span>
              </div>
            </div>
            <Badge 
              variant={
                proposal.status === 'accepted' ? 'default' : 
                proposal.status === 'withdrawn' ? 'outline' : 
                'secondary'
              }
            >
              {proposal.status}
            </Badge>
          </div>

          <div className="flex flex-col space-y-1 text-sm">
            <span className="text-xs text-muted-foreground uppercase font-medium">
              Proposed Amount
            </span>
            <div className="flex flex-col">
              <span className="font-medium">
                {formatTokenAmount(proposal.proposed_amount)}
              </span>
              <span className="text-xs text-muted-foreground font-mono truncate">
                {getTokenLabel(proposal.proposed_mint)}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-mono">
              Offer: {proposal.offer_id.slice(0, 8)}...
            </span>
            <a
              href={`https://explorer.solana.com/tx/${proposal.signature}?cluster=devnet`}
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

