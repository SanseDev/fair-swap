import { CreateOfferForm } from "@/components/create-offer-form";

export default function CreateOfferPage() {
  return (
    <div className="container mx-auto max-w-2xl py-12">
        <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Create Offer</h1>
            <p className="text-muted-foreground">List your tokens for swap with other users.</p>
        </div>
        <CreateOfferForm />
    </div>
  );
}






