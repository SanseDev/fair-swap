import { OfferList } from "@/components/offer-list";

export default function MarketplacePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Marketplace</h1>
        <p className="text-muted-foreground">
          Browse and accept active offers from other users.
        </p>
      </div>
      <OfferList />
    </div>
  );
}

