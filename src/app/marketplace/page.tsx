import { OfferList } from "@/components/offer-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function MarketplacePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Marketplace</h1>
          <p className="text-muted-foreground">
            Browse and accept active offers from other users.
          </p>
        </div>
        <Link href="/create-offer">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Offer
          </Button>
        </Link>
      </div>
      <OfferList />
    </div>
  );
}

