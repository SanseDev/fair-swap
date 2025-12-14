import { SwapStats } from "@/components/swap-stats";
import { RecentActivity } from "@/components/recent-activity";
import { MySwaps } from "@/components/my-swaps";
import { MyOffers } from "@/components/my-offers";
import { MyProposals } from "@/components/my-proposals";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-12">
      <section>
        <SwapStats />
      </section>

      <section className="space-y-6 p-6 rounded-lg border border-border/40 bg-muted/5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium tracking-tight">My Activity</h2>
            <span className="text-xs text-muted-foreground">Your swap history & active trades</span>
          </div>
          <Link href="/create-offer">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Offer
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Completed Swaps
            </h3>
            <MySwaps />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Active Offers
            </h3>
            <MyOffers />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              My Proposals
            </h3>
            <MyProposals />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium tracking-tight">Global Activity</h2>
        </div>
        <RecentActivity />
      </section>
    </div>
  );
}

