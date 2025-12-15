"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Proposal, Offer } from "@/lib/types";
import { AssetDisplay } from "@/components/asset-display";
import { formatDistanceToNow } from "date-fns";
import { useAcceptProposal } from "@/hooks/use-accept-proposal";
import { toast } from "sonner";

interface ProposalsListProps {
  proposals: Proposal[];
  offer: Offer;
  isSeller: boolean;
  onProposalAccepted?: () => void;
}

export function ProposalsList({ 
  proposals, 
  offer, 
  isSeller,
  onProposalAccepted 
}: ProposalsListProps) {
  const { acceptProposal, isLoading } = useAcceptProposal();

  const handleAccept = async (proposal: Proposal) => {
    try {
      const result = await acceptProposal({
        proposal,
        offer,
      });

      toast.success("Proposal accepted!", {
        description: `Transaction: ${result.signature.slice(0, 8)}...`,
      });

      onProposalAccepted?.();
    } catch (err: any) {
      console.error("Failed to accept proposal:", err);
      toast.error("Failed to accept proposal", {
        description: err.message || "Please try again",
      });
    }
  };

  if (proposals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No proposals yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {proposals.map((proposal) => (
        <Card key={proposal.id}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Buyer */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  From:
                </span>
                <span className="font-mono text-xs truncate max-w-[200px]">
                  {proposal.buyer}
                </span>
              </div>

              {/* Proposed Asset */}
              <div className="space-y-2">
                <span className="text-sm font-medium">Proposed Asset:</span>
                <AssetDisplay
                  mint={proposal.proposed_mint}
                  amount={proposal.proposed_amount}
                  imageSize="md"
                />
              </div>

              {/* Status & Time */}
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    proposal.status === "accepted"
                      ? "default"
                      : proposal.status === "withdrawn"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {proposal.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(proposal.created_at))} ago
                </span>
              </div>

              {/* Actions for Seller */}
              {isSeller && proposal.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleAccept(proposal)}
                    disabled={isLoading}
                    size="sm"
                    className="flex-1"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Decline
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

