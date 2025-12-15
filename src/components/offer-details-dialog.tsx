"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Offer } from "@/lib/types";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { AssetDisplay } from "@/components/asset-display";
import { ProposalForm } from "@/components/proposal-form";
import { ProposalsList } from "@/components/proposals-list";
import { useProposalsByOffer } from "@/hooks/use-proposals";
import { Loader2, MessageSquare } from "lucide-react";

interface OfferDetailsDialogProps {
  offer: Offer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept?: (offer: Offer) => void;
  isAccepting?: boolean;
}

export function OfferDetailsDialog({
  offer,
  open,
  onOpenChange,
  onAccept,
  isAccepting = false,
}: OfferDetailsDialogProps) {
  const { walletAddress, isConnected } = useWalletAuth();
  const [activeTab, setActiveTab] = useState<"details" | "proposals">("details");

  const { data: proposals = [], isLoading: loadingProposals, refetch: refetchProposals } = useProposalsByOffer(
    offer?.offer_id || ""
  );

  if (!offer) return null;

  const isSeller = isConnected && walletAddress === offer.seller;
  const canAccept = isConnected && !isSeller;
  const pendingProposals = proposals.filter(p => p.status === "pending");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Offer Details</DialogTitle>
          <DialogDescription>
            {isSeller
              ? "Manage your offer and review proposals"
              : "Review the offer details or make a proposal"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="proposals" className="relative">
              Proposals
              {pendingProposals.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {pendingProposals.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-right">Seller:</span>
              <span className="col-span-3 font-mono text-sm truncate">
                {offer.seller}
              </span>
            </div>
            
            <div className="space-y-1">
              <span className="text-sm font-bold">Seller Offers:</span>
              <AssetDisplay 
                mint={offer.token_mint_a}
                amount={offer.token_amount_a}
                imageSize="lg"
              />
            </div>

            <div className="space-y-1">
              <span className="text-sm font-bold">Seller Requests:</span>
              <AssetDisplay 
                mint={offer.token_mint_b}
                amount={offer.token_amount_b}
                imageSize="lg"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-right">Type:</span>
               <Badge variant={offer.allow_alternatives ? "secondary" : "outline"} className="w-fit col-span-3">
                  {offer.allow_alternatives ? "Negotiable" : "Fixed Price"}
               </Badge>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-right">Posted:</span>
              <span className="col-span-3 text-sm text-muted-foreground">
                 {formatDistanceToNow(new Date(offer.created_at))} ago
              </span>
            </div>

            {/* Show proposal form for buyers if offer allows alternatives */}
            {canAccept && offer.allow_alternatives && (
              <div className="pt-4 border-t">
                <div className="mb-4 p-3 bg-muted/50 rounded-lg text-sm">
                  <p className="font-medium mb-1">💡 Two Options Available:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Accept the seller's request with the exact assets they want</li>
                    <li>Make your own proposal with different assets below</li>
                  </ul>
                </div>
                <ProposalForm 
                  offer={offer} 
                  onSuccess={() => {
                    refetchProposals();
                    setActiveTab("proposals");
                  }}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="proposals" className="mt-4">
            {loadingProposals ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ProposalsList
                proposals={proposals}
                offer={offer}
                isSeller={isSeller}
                onProposalAccepted={() => {
                  refetchProposals();
                  onOpenChange(false);
                }}
              />
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isSeller ? (
            <Button variant="outline" onClick={() => setActiveTab("proposals")}>
              <MessageSquare className="mr-2 h-4 w-4" />
              View Proposals ({pendingProposals.length})
            </Button>
          ) : canAccept ? (
            <>
              <Button 
                onClick={() => onAccept?.(offer)} 
                disabled={isAccepting}
                className="flex-1"
              >
                {isAccepting ? "Processing..." : "Accept Offer"}
              </Button>
              {offer.allow_alternatives && activeTab === "proposals" && (
                <Button 
                  variant="secondary" 
                  onClick={() => setActiveTab("details")}
                  className="flex-1"
                >
                  Make Alternative Proposal
                </Button>
              )}
            </>
          ) : !isConnected ? (
            <Button variant="secondary" disabled>Connect Wallet</Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

