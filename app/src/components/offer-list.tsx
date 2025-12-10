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

export function OfferList() {
  const [filters, setFilters] = useState({
    seller: "",
    token_mint_a: "",
    token_mint_b: "",
  });

  const { data: offers, isLoading } = useQuery({
    queryKey: ["offers", filters],
    queryFn: () => getOffers({ ...filters, status: 'active' }),
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-1 bg-muted/30 rounded-lg">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search seller..."
              className="pl-9 border-none shadow-none bg-transparent focus-visible:ring-0"
              value={filters.seller}
              onChange={(e) => handleFilterChange("seller", e.target.value)}
            />
        </div>
        <div className="h-6 w-px bg-border/50" />
        <Input
          placeholder="Token A"
          className="w-[150px] border-none shadow-none bg-transparent focus-visible:ring-0"
          value={filters.token_mint_a}
          onChange={(e) => handleFilterChange("token_mint_a", e.target.value)}
        />
        <div className="h-6 w-px bg-border/50" />
        <Input
          placeholder="Token B"
          className="w-[150px] border-none shadow-none bg-transparent focus-visible:ring-0"
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
                <TableRow key={offer.id} className="border-border/40 group">
                  <TableCell className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    {offer.seller.slice(0, 4)}...{offer.seller.slice(-4)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <span className="font-medium">{offer.token_amount_a}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{offer.token_mint_a.slice(0, 6)}...</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <span className="font-medium">{offer.token_amount_b}</span>
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
                    <Button size="sm" variant="ghost" className="w-full h-8 text-xs">View</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
