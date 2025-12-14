"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Search, Image as ImageIcon, CheckCircle } from "lucide-react";
import { useWalletNFTs, WalletNFT } from "@/hooks/use-wallet-nfts";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { cn } from "@/lib/utils";

interface NFTSelectorProps {
  value?: string;
  onChange: (mint: string, nft?: WalletNFT) => void;
  label?: string;
  excludeMint?: string;
}

export function NFTSelector({ value, onChange, label = "Select NFT", excludeMint }: NFTSelectorProps) {
  const { isConnected } = useWalletAuth();
  const { nfts, isLoading } = useWalletNFTs();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNFT, setSelectedNFT] = useState<WalletNFT | null>(null);

  // Find selected NFT info
  useEffect(() => {
    if (value) {
      const nft = nfts.find((n) => n.mint === value);
      if (nft) {
        setSelectedNFT(nft);
      }
    }
  }, [value, nfts]);

  // Filter NFTs based on search
  const filteredNFTs = nfts.filter((nft) => {
    if (excludeMint && nft.mint === excludeMint) return false;
    if (!searchQuery) return true;
    return (
      nft.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.mint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.metadata?.collection?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSelectNFT = (nft: WalletNFT) => {
    onChange(nft.mint, nft);
    setSelectedNFT(nft);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full justify-between h-auto py-3"
      >
        <div className="flex items-center gap-3">
          {selectedNFT?.image ? (
            <img src={selectedNFT.image} alt={selectedNFT.name} className="w-10 h-10 rounded object-cover" />
          ) : (
            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div className="text-left">
            <div className="font-medium">{selectedNFT?.name || "Select NFT"}</div>
            {selectedNFT && (
              <div className="text-xs text-muted-foreground">
                {selectedNFT.mint.slice(0, 4)}...{selectedNFT.mint.slice(-4)}
              </div>
            )}
          </div>
        </div>
        <Search className="w-4 h-4 text-muted-foreground" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, collection, or mint..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {!isConnected ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                Please connect your wallet to view NFTs
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredNFTs.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                {searchQuery ? "No NFTs found matching search" : "No NFTs in wallet"}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredNFTs.map((nft) => (
                  <button
                    key={nft.mint}
                    type="button"
                    onClick={() => handleSelectNFT(nft)}
                    className={cn(
                      "group relative flex flex-col rounded-lg border-2 transition-all hover:border-primary/50",
                      value === nft.mint ? "border-primary ring-2 ring-primary/20" : "border-border"
                    )}
                  >
                    {/* NFT Image */}
                    <div className="aspect-square rounded-t-lg overflow-hidden bg-muted">
                      {nft.image ? (
                        <img
                          src={nft.image}
                          alt={nft.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* NFT Info */}
                    <div className="p-2 bg-card">
                      <div className="font-medium text-sm truncate" title={nft.name}>
                        {nft.name}
                      </div>
                      {nft.metadata?.collection?.name && (
                        <div className="text-xs text-muted-foreground truncate">
                          {nft.metadata.collection.name}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground truncate mt-1">
                        {nft.mint.slice(0, 4)}...{nft.mint.slice(-4)}
                      </div>
                    </div>

                    {/* Selected Indicator */}
                    {value === nft.mint && (
                      <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                        <CheckCircle className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

