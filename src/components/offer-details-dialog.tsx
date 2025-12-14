"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Offer } from "@/lib/types";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { AssetDisplay } from "@/components/asset-display";

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

  if (!offer) return null;

  const isSeller = isConnected && walletAddress === offer.seller;
  const canAccept = isConnected && !isSeller;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Offer Details</DialogTitle>
          <DialogDescription>
            Review the details of this offer before accepting.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
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
        </div>
        <DialogFooter>
          {canAccept ? (
            <Button 
              onClick={() => onAccept?.(offer)} 
              disabled={isAccepting}
            >
              {isAccepting ? "Processing..." : "Accept Offer"}
            </Button>
          ) : isSeller ? (
            <Button variant="outline" disabled>You are the seller</Button>
          ) : (
            <Button variant="secondary" disabled>Connect Wallet to Accept</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

