"use client";

import { CreateOfferForm } from "@/components/create-offer-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreateOfferPage() {
  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Link href="/marketplace">
        <Button variant="ghost" size="sm" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>
      </Link>

      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Create New Offer</h1>
          <p className="text-lg text-muted-foreground">
            Set up a secure P2P swap. Define what you offer and what you want in return.
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            <CreateOfferForm />
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            By creating an offer, you agree to our <Link href="#" className="underline hover:text-primary">Terms of Service</Link>.
            Assets are held in escrow until the swap is completed.
          </p>
        </div>
      </div>
    </div>
  );
}
