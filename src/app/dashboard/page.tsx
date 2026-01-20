import { SwapStats } from "@/components/swap-stats";
import { RecentActivity } from "@/components/recent-activity";
import { MySwaps } from "@/components/my-swaps";
import { MyOffers } from "@/components/my-offers";
import { MyProposals } from "@/components/my-proposals";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, History, Wallet, FileText } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your active offers, proposals, and swap history.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/create-offer">
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" />
              New Offer
            </Button>
          </Link>
        </div>
      </div>

      <section>
        <SwapStats />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Active Offers Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                My Active Offers
              </h2>
              <Link href="/marketplace">
                <Button variant="link" size="sm" className="text-muted-foreground hover:text-primary h-auto p-0">
                  View Market <ArrowUpRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
              <div className="p-1">
                <MyOffers />
              </div>
            </div>
          </section>

          {/* Proposals Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Incoming & Outgoing Proposals
              </h2>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
               <div className="p-1">
                <MyProposals />
              </div>
            </div>
          </section>

          {/* History Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <History className="w-4 h-4 text-blue-400" />
                Swap History
              </h2>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
              <div className="p-1">
                <MySwaps />
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm shadow-sm">
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Global Activity</h3>
                <RecentActivity />
              </div>

              <div className="rounded-2xl border border-border/50 bg-linear-to-br from-blue-500/10 to-cyan-500/5 p-6 backdrop-blur-sm">
                <h3 className="font-semibold mb-2">Pro Tip</h3>
                <p className="text-sm text-muted-foreground">
                  Verify the token mint addresses before accepting any proposal to ensure you receive the correct assets.
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
