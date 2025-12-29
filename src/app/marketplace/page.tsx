"use client";

import { OfferList } from "@/components/offer-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, SlidersHorizontal, ArrowUpRight } from "lucide-react";
import { RecentActivity } from "@/components/recent-activity/recent-activity";

export default function MarketplacePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section - More Professional, Less Shiny */}
      <div className="relative overflow-hidden rounded-3xl bg-muted/30 border border-border/50 p-8 md:p-12">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary/80">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary/60 mr-2"></span>
              Live Market
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Explore Active Offers
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Browse secure peer-to-peer swap offers on Solana. Trade tokens safely with our escrow-based system.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/create-offer">
                <Button size="lg" className="rounded-full px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Offer
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="rounded-full px-8 bg-background/50 hover:bg-background/80">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </div>
          
          {/* Subtle decoration instead of shiny gradient */}
          <div className="hidden lg:block absolute right-0 top-0 h-full w-1/3 bg-linear-to-l from-primary/5 to-transparent pointer-events-none opacity-50" />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Active Listings</h2>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </Button>
          </div>
          
          <div className="bg-card border border-border/50 rounded-2xl p-1 shadow-sm">
            <OfferList />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500/70"></span>
                Recent Activity
              </h3>
              <RecentActivity />
            </div>

            <div className="rounded-2xl border border-border/50 bg-primary/5 p-6">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Learn how to swap safely on FairSwap with our step-by-step guide.
              </p>
              <Button variant="link" className="p-0 h-auto text-primary">Read Guide &rarr;</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
