"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRightLeft, Info } from "lucide-react";
import { useCreateOffer } from "@/hooks/use-create-offer";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { AssetSelector, SelectedAsset } from "@/components/asset-selector";
import { toast } from "sonner";
import { toTokenAmount } from "@/lib/token-utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function CreateOfferForm() {
  const router = useRouter();
  const { isConnected, isAuthenticated, openWalletModal } = useWalletAuth();
  const { createOffer, isLoading } = useCreateOffer();

  const [selectedAssetA, setSelectedAssetA] = useState<SelectedAsset | null>(null);
  const [selectedAssetB, setSelectedAssetB] = useState<SelectedAsset | null>(null);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [allowAlternatives, setAllowAlternatives] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate asset A selection
    if (!selectedAssetA) {
      newErrors.assetA = "Please select an asset";
    }

    // Validate asset B selection
    if (!selectedAssetB) {
      newErrors.assetB = "Please select an asset";
    }

    if (selectedAssetA && selectedAssetB && selectedAssetA.mint === selectedAssetB.mint) {
      newErrors.assetB = "Cannot swap the same asset";
    }

    // Validate amounts for tokens (NFTs are always amount = 1)
    if (selectedAssetA?.type === "token") {
      const parsedAmountA = parseFloat(amountA);
      if (!amountA || isNaN(parsedAmountA) || parsedAmountA <= 0) {
        newErrors.amountA = "Amount must be greater than 0";
      }

      // Check balance for tokens
      if (selectedAssetA.data && "uiAmount" in selectedAssetA.data) {
        const availableBalance = parseFloat(selectedAssetA.data.uiAmount);
        if (parsedAmountA > availableBalance) {
          newErrors.amountA = `Insufficient balance (available: ${selectedAssetA.data.uiAmount})`;
        }
      }
    }

    if (selectedAssetB?.type === "token") {
      const parsedAmountB = parseFloat(amountB);
      if (!amountB || isNaN(parsedAmountB) || parsedAmountB <= 0) {
        newErrors.amountB = "Amount must be greater than 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      openWalletModal();
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please authenticate your wallet");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    try {
      // Convert amounts to smallest unit using actual decimals
      const finalAmountA = selectedAssetA!.type === "nft" ? "1" : amountA;
      const finalAmountB = selectedAssetB!.type === "nft" ? "1" : amountB;
      
      const decimalsA = selectedAssetA!.decimals || 0;
      const decimalsB = selectedAssetB!.decimals || 0;
      
      const tokenAmountA = toTokenAmount(finalAmountA, decimalsA);
      const tokenAmountB = toTokenAmount(finalAmountB, decimalsB);

      const result = await createOffer({
        tokenMintA: selectedAssetA!.mint,
        tokenAmountA,
        tokenMintB: selectedAssetB!.mint,
        tokenAmountB,
        allowAlternatives,
      });

      toast.success("Offer created successfully!", {
        description: `Transaction: ${result.signature.slice(0, 8)}...`,
      });

      router.push("/marketplace");
    } catch (err: any) {
      console.error("Failed to create offer:", err);
      toast.error("Failed to create offer", {
        description: err.message || "Please try again",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        {/* Connection Line (Desktop) */}
        <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-background border border-border/50 rounded-full p-2 shadow-xl">
             <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {/* Asset A (Offering) */}
        <div className="space-y-4 rounded-xl border border-border/40 bg-muted/20 p-6">
            <div className="space-y-1">
                <h3 className="text-lg font-medium">You Offer</h3>
                <p className="text-sm text-muted-foreground">Select the asset you want to trade</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Asset</Label>
                    <AssetSelector
                        value={selectedAssetA || undefined}
                        onChange={(asset) => {
                            setSelectedAssetA(asset);
                            if (asset.type === "nft") setAmountA("1");
                            setErrors({ ...errors, assetA: "" });
                        }}
                        label="Select Asset"
                        excludeMint={selectedAssetB?.mint}
                    />
                    {errors.assetA && <p className="text-xs text-red-500">{errors.assetA}</p>}
                </div>

                {selectedAssetA?.type === "token" && (
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label>Amount</Label>
                        {selectedAssetA.data && "uiAmount" in selectedAssetA.data && (
                            <span className="text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => setAmountA(selectedAssetA.data.uiAmount)}>
                                Balance: {selectedAssetA.data.uiAmount}
                            </span>
                        )}
                    </div>
                    <div className="relative">
                        <Input
                            type="number"
                            step="any"
                            placeholder="0.00"
                            value={amountA}
                            onChange={(e) => {
                                setAmountA(e.target.value);
                                setErrors({ ...errors, amountA: "" });
                            }}
                            className={`pr-16 text-lg font-mono ${errors.amountA ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                         <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                            {selectedAssetA.data.symbol || "TOK"}
                         </div>
                    </div>
                    {errors.amountA && <p className="text-xs text-red-500">{errors.amountA}</p>}
                </div>
                )}
            </div>
        </div>

        {/* Asset B (Requesting) */}
        <div className="space-y-4 rounded-xl border border-border/40 bg-muted/20 p-6">
            <div className="space-y-1">
                <h3 className="text-lg font-medium">You Receive</h3>
                <p className="text-sm text-muted-foreground">Select the asset you want in return</p>
            </div>

            <div className="space-y-4">
                 <div className="space-y-2">
                    <Label>Asset</Label>
                    <AssetSelector
                        value={selectedAssetB || undefined}
                        onChange={(asset) => {
                            setSelectedAssetB(asset);
                            if (asset.type === "nft") setAmountB("1");
                            setErrors({ ...errors, assetB: "" });
                        }}
                        label="Select Asset"
                        excludeMint={selectedAssetA?.mint}
                    />
                    {errors.assetB && <p className="text-xs text-red-500">{errors.assetB}</p>}
                </div>

                {selectedAssetB?.type === "token" && (
                <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="relative">
                        <Input
                            type="number"
                            step="any"
                            placeholder="0.00"
                            value={amountB}
                            onChange={(e) => {
                                setAmountB(e.target.value);
                                setErrors({ ...errors, amountB: "" });
                            }}
                            className={`pr-16 text-lg font-mono ${errors.amountB ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                         <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
                            {selectedAssetB.data.symbol || "TOK"}
                         </div>
                    </div>
                    {errors.amountB && <p className="text-xs text-red-500">{errors.amountB}</p>}
                </div>
                )}
            </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-xl border border-border/40 bg-linear-to-r from-blue-500/5 to-purple-500/5">
        <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-background border border-border/50">
                <Info className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
                <h4 className="font-medium">Negotiation Options</h4>
                <p className="text-sm text-muted-foreground">Allow buyers to propose different assets than what you requested.</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
             <Label htmlFor="allow-alternatives" className="cursor-pointer">Allow Proposals</Label>
             <Switch 
                id="allow-alternatives"
                checked={allowAlternatives}
                onCheckedChange={setAllowAlternatives}
             />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-border/40">
        <Button
          variant="ghost"
          type="button"
          onClick={() => router.back()}
          disabled={isLoading}
          className="hover:bg-muted"
        >
          Cancel
        </Button>
        <Button 
            type="submit" 
            disabled={isLoading || !isConnected} 
            size="lg"
            className="px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!isConnected
            ? "Connect Wallet to Create"
            : isLoading
            ? "Creating..."
            : "Create Offer"}
        </Button>
      </div>
    </form>
  );
}
