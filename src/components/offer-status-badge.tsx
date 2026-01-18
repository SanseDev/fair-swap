"use client";

import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useVerifyOffer } from "@/hooks/use-verify-offer";
import { Offer } from "@/lib/types";

interface OfferStatusBadgeProps {
  offer: Offer;
}

export function OfferStatusBadge({ offer }: OfferStatusBadgeProps) {
  const { isValid, isChecking } = useVerifyOffer(offer);

  if (isChecking) {
    return (
      <Badge variant="outline" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Checking...
      </Badge>
    );
  }

  if (isValid === false) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        No longer available
      </Badge>
    );
  }

  if (isValid === true) {
    return (
      <Badge variant="default" className="gap-1 bg-green-600">
        <CheckCircle className="h-3 w-3" />
        Available
      </Badge>
    );
  }

  return null;
}


