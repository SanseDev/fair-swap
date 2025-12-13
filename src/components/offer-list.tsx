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
import { useState } from "react";
import { Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { OfferDetailsDialog } from "./offer-details-dialog";
import { Offer } from "@/lib/types";
import { formatTokenAmount } from "@/lib/token-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function OfferList() {
  const [filters, setFilters] = useState({
    seller: "",
    token_mint_a: "",
    token_mint_b: "",
    asset_type: "all",
  });
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  const { data: offers, isLoading } = useQuery({
    queryKey: ["offers", filters],
    queryFn: () => getOffers({ ...filters, status: 'active' }),
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleAccept = (offer: Offer) => {
    console.log("Accepting offer:", offer.id);
    // TODO: Implement accept logic
    setSelectedOffer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-4 p-1 bg-muted/30 rounded-lg">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search seller..."
              className="pl-9 border-none shadow-none bg-transparent focus-visible:ring-0"
              value={filters.seller}
              onChange={(e) => handleFilterChange("seller", e.target.value)}
            />
        </div>
        <div className="hidden sm:block h-6 w-px bg-border/50" />
        <div className="flex items-center gap-2 w-full sm:w-auto">
           <Select value={filters.asset_type} onValueChange={(value) => handleFilterChange("asset_type", value)}>
            <SelectTrigger className="w-[140px] border-none shadow-none bg-transparent focus:ring-0">
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
        <div className="hidden sm:block h-6 w-px bg-border/50" />
        <Input
          placeholder="Token A Mint"
          className="w-full sm:w-[150px] border-none shadow-none bg-transparent focus-visible:ring-0"
          value={filters.token_mint_a}
          onChange={(e) => handleFilterChange("token_mint_a", e.target.value)}
        />
        <div className="hidden sm:block h-6 w-px bg-border/50" />
        <Input
          placeholder="Token B Mint"
          className="w-full sm:w-[150px] border-none shadow-none bg-transparent focus-visible:ring-0"
          value={filters.token_mint_b}
          onChange={(e) => handleFilterChange("token_mint_b", e.target.value)}
        />
      </div>

      <div className="rounded-md border border-border/40 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead className="font-medium text-xs uppercase tracking-wider">Seller</TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider">Selling</TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider">Buying</TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider">Type</TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-right">Age</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="border-border/40">
                  <TableCell><div className="h-4 w-24 bg-muted/50 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-muted/50 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-muted/50 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-12 bg-muted/50 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-12 bg-muted/50 rounded animate-pulse ml-auto" /></TableCell>
                  <TableCell><div className="h-8 w-full bg-muted/50 rounded animate-pulse" /></TableCell>
                </TableRow>
              ))
            ) : offers?.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No active offers found.
                 </TableCell>
               </TableRow>
            ) : (
              offers?.map((offer) => (
                <TableRow 
                  key={offer.id} 
                  className="border-border/40 group cursor-pointer hover:bg-muted/5"
                  onClick={() => setSelectedOffer(offer)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    {offer.seller.slice(0, 4)}...{offer.seller.slice(-4)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <span className="font-medium">{formatTokenAmount(offer.token_amount_a)}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{offer.token_mint_a.slice(0, 6)}...</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <span className="font-medium">{formatTokenAmount(offer.token_amount_b)}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{offer.token_mint_b.slice(0, 6)}...</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={offer.allow_alternatives ? "secondary" : "outline"} className="text-[10px] font-normal h-5">
                       {offer.allow_alternatives ? "Negotiable" : "Fixed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(offer.created_at))}
                  </TableCell>
                  <TableCell>
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        className="w-full h-8 text-xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOffer(offer);
                        }}
                    >
                        View
                    </Button>
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
      />
    </div>
  );
}
