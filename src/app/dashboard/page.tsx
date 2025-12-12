import { SwapStats } from "@/components/swap-stats";
import { OfferList } from "@/components/offer-list";
import { ProposalHistory } from "@/components/proposal-history";

export default function DashboardPage() {
  return (
    <div className="space-y-12">
      <section>
        <SwapStats />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium tracking-tight">Marketplace</h2>
                <span className="text-xs text-muted-foreground">Live Feed</span>
            </div>
            <OfferList />
        </div>
        <div className="lg:col-span-4 space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium tracking-tight">Recent Activity</h2>
            </div>
            <ProposalHistory />
        </div>
      </div>
    </div>
  );
}

