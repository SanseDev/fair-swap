"use client";

import { useQuery } from "@tanstack/react-query";
import { getOffers } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Search, Filter, RefreshCw, ArrowRightLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { OfferDetailsDialog } from "./offer-details-dialog";
import { Offer } from "@/lib/types";
import { AssetDisplay } from "@/components/asset-display";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAcceptOffer } from "@/hooks/use-accept-offer";
import { useToast } from "@/hooks/use-toast";
import { useConnection } from "@solana/wallet-adapter-react";
import { verifyOfferExists } from "@/lib/onchain-utils";
import { cn } from "@/lib/utils";

export function OfferList() {
  const [filters, setFilters] = useState({
    seller: "",
    token_mint_a: "",
    token_mint_b: "",
    asset_type: "all",
  });
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [validOffers, setValidOffers] = useState<Offer[]>([]);
  const { acceptOffer, isLoading: isAccepting } = useAcceptOffer();
  const { toast } = useToast();
  const { connection } = useConnection();

  const { data: offers, isLoading, refetch } = useQuery({
    queryKey: ["offers", filters],
    queryFn: () => getOffers({ ...filters, status: 'active' }),
  });

  // Filter out offers that no longer exist on-chain
  useEffect(() => {
    if (!offers) return;
    
    const checkOffers = async () => {
      const checkedOffers = await Promise.all(
        offers.map(async (offer) => {
          const exists = await verifyOfferExists(connection, offer.seller, offer.offer_id);
          return exists ? offer : null;
        })
      );
      setValidOffers(checkedOffers.filter((o): o is Offer => o !== null));
    };
    
    checkOffers();
  }, [offers, connection]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleAccept = async (offer: Offer) => {
    try {
      const result = await acceptOffer(offer);
      toast({
        title: "Offer Accepted!",
        description: `Transaction: ${result.signature.slice(0, 8)}...`,
      });
      setSelectedOffer(null);
      refetch(); // Refresh offers list
    } catch (error: any) {
      toast({
        title: "Failed to accept offer",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 p-2 bg-muted/40 backdrop-blur-md rounded-xl border border-white/5">
        <div className="relative flex-1 w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by seller address..."
              className="pl-9 border-none shadow-none bg-transparent focus-visible:ring-0 h-10"
              value={filters.seller}
              onChange={(e) => handleFilterChange("seller", e.target.value)}
            />
        </div>
        
        <div className="hidden md:block h-6 w-px bg-border/40" />
        
        <div className="flex items-center gap-2 w-full md:w-auto">
           <Filter className="w-4 h-4 text-muted-foreground md:hidden" />
           <Select value={filters.asset_type} onValueChange={(value) => handleFilterChange("asset_type", value)}>
            <SelectTrigger className="w-full md:w-[140px] border-none shadow-none bg-transparent focus:ring-0 h-10">
              <SelectValue placeholder="Asset Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assets</SelectItem>
              <SelectItem value="sol">SOL</SelectItem>
              <SelectItem value="spl">SPL Tokens</SelectItem>
              <SelectItem value="nft">NFTs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="hidden md:block h-6 w-px bg-border/40" />

        <div className="flex gap-2 w-full md:w-auto">
          <Input
            placeholder="Offering (Mint)"
            className="w-full md:w-[160px] border-none shadow-none bg-transparent focus-visible:ring-0 h-10 text-xs font-mono"
            value={filters.token_mint_a}
            onChange={(e) => handleFilterChange("token_mint_a", e.target.value)}
          />
          <div className="hidden md:block h-6 w-px bg-border/40 self-center" />
           <Input
            placeholder="Requesting (Mint)"
            className="w-full md:w-[160px] border-none shadow-none bg-transparent focus-visible:ring-0 h-10 text-xs font-mono"
            value={filters.token_mint_b}
            onChange={(e) => handleFilterChange("token_mint_b", e.target.value)}
          />
        </div>
        
        <Button variant="ghost" size="icon" onClick={() => refetch()} className="hidden md:flex text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Offers Table */}
      <div className="rounded-xl border border-border/40 overflow-hidden bg-background/40 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Offer Details</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-center">Exchange</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Request Details</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="border-border/40">
                  <TableCell><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-muted/50 animate-pulse" /><div className="space-y-2"><div className="h-4 w-24 bg-muted/50 rounded animate-pulse" /><div className="h-3 w-16 bg-muted/50 rounded animate-pulse" /></div></div></TableCell>
                  <TableCell><div className="flex justify-center"><ArrowRightLeft className="text-muted/20" /></div></TableCell>
                  <TableCell><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-muted/50 animate-pulse" /><div className="space-y-2"><div className="h-4 w-24 bg-muted/50 rounded animate-pulse" /><div className="h-3 w-16 bg-muted/50 rounded animate-pulse" /></div></div></TableCell>
                  <TableCell><div className="h-8 w-20 ml-auto bg-muted/50 rounded animate-pulse" /></TableCell>
                </TableRow>
              ))
            ) : validOffers.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 opacity-20" />
                        <p>No active offers found matching your filters.</p>
                    </div>
                 </TableCell>
               </TableRow>
            ) : (
              validOffers.map((offer) => (
                <TableRow 
                  key={offer.id} 
                  className="border-border/40 group cursor-pointer hover:bg-muted/10 transition-colors"
                  onClick={() => setSelectedOffer(offer)}
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                        <AssetDisplay 
                            mint={offer.token_mint_a}
                            amount={offer.token_amount_a}
                            imageSize="sm"
                            className="h-10 w-10"
                        />
                        <div className="flex flex-col">
                            <span className="font-medium text-sm">Selling</span>
                            <span className="text-xs text-muted-foreground font-mono">
                                {offer.seller.slice(0, 4)}...{offer.seller.slice(-4)}
                            </span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex justify-center text-muted-foreground/30 group-hover:text-primary/50 transition-colors">
                        <ArrowRightLeft className="w-5 h-5" />
                     </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                        <AssetDisplay 
                            mint={offer.token_mint_b}
                            amount={offer.token_amount_b}
                            imageSize="sm"
                            className="h-10 w-10"
                        />
                        <div className="flex flex-col">
                            <span className="font-medium text-sm">Buying</span>
                            <span className="text-xs text-muted-foreground">
                                {offer.allow_alternatives ? "Or similar" : "Fixed"}
                            </span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-1">
                        <Badge variant={offer.allow_alternatives ? "secondary" : "outline"} className="text-[10px] font-normal">
                            {offer.allow_alternatives ? "Negotiable" : "Strict"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(offer.created_at), { addSuffix: true })}
                        </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <OfferDetailsDialog 
        offer={selectedOffer} 
        open={!!selectedOffer} 
        onOpenChange={(open) => !open && setSelectedOffer(null)}
        onAccept={handleAccept}
        isAccepting={isAccepting}
      />
    </div>
  );
}
