"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Coins } from "lucide-react";
import { useCreateOffer } from "@/hooks/use-create-offer";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { AssetSelector, SelectedAsset } from "@/components/asset-selector";
import { toast } from "sonner";
import { toTokenAmount } from "@/lib/token-utils";

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
    <Card>
      <CardHeader>
        <CardTitle>Create New Offer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Asset A (Offering) */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  You Offer (Asset A)
                </label>
                <div className="space-y-2">
                  <AssetSelector
                    value={selectedAssetA || undefined}
                    onChange={(asset) => {
                      setSelectedAssetA(asset);
                      // For NFTs, amount is always 1
                      if (asset.type === "nft") {
                        setAmountA("1");
                      }
                      setErrors({ ...errors, assetA: "" });
                    }}
                    label="Select Asset to Offer"
                    excludeMint={selectedAssetB?.mint}
                  />
                  {errors.assetA && (
                    <p className="text-xs text-red-500 mt-1">{errors.assetA}</p>
                  )}
                  
                  {/* Amount input for tokens only */}
                  {selectedAssetA?.type === "token" && (
                    <div>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Amount (e.g., 10.5)"
                        value={amountA}
                        onChange={(e) => {
                          setAmountA(e.target.value);
                          setErrors({ ...errors, amountA: "" });
                        }}
                        className={errors.amountA ? "border-red-500" : ""}
                      />
                      {errors.amountA && (
                        <p className="text-xs text-red-500 mt-1">{errors.amountA}</p>
                      )}
                      {selectedAssetA.data && "uiAmount" in selectedAssetA.data && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Available: {selectedAssetA.data.uiAmount} {selectedAssetA.data.symbol}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {selectedAssetA?.type === "nft" && (
                    <p className="text-xs text-muted-foreground">NFT swaps are always 1:1</p>
                  )}
                </div>
              </div>

              {/* Asset B (Requesting) */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  You Request (Asset B)
                </label>
                <div className="space-y-2">
                  <AssetSelector
                    value={selectedAssetB || undefined}
                    onChange={(asset) => {
                      setSelectedAssetB(asset);
                      // For NFTs, amount is always 1
                      if (asset.type === "nft") {
                        setAmountB("1");
                      }
                      setErrors({ ...errors, assetB: "" });
                    }}
                    label="Select Asset to Request"
                    excludeMint={selectedAssetA?.mint}
                  />
                  {errors.assetB && (
                    <p className="text-xs text-red-500 mt-1">{errors.assetB}</p>
                  )}
                  
                  {/* Amount input for tokens only */}
                  {selectedAssetB?.type === "token" && (
                    <div>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Amount (e.g., 100)"
                        value={amountB}
                        onChange={(e) => {
                          setAmountB(e.target.value);
                          setErrors({ ...errors, amountB: "" });
                        }}
                        className={errors.amountB ? "border-red-500" : ""}
                      />
                      {errors.amountB && (
                        <p className="text-xs text-red-500 mt-1">{errors.amountB}</p>
                      )}
                    </div>
                  )}
                  
                  {selectedAssetB?.type === "nft" && (
                    <p className="text-xs text-muted-foreground">NFT swaps are always 1:1</p>
                  )}
                </div>
              </div>
            </div>

            {/* Alternative Proposals Option */}
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
              <input
                type="checkbox"
                id="alternatives"
                checked={allowAlternatives}
                onChange={(e) => setAllowAlternatives(e.target.checked)}
                className="h-4 w-4 mt-0.5 rounded border-gray-300"
              />
              <div className="flex-1">
                <label
                  htmlFor="alternatives"
                  className="text-sm font-medium cursor-pointer"
                >
                  Allow alternative proposals
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Buyers can propose different tokens than what you requested
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <CheckCircle className="h-4 w-4 inline mr-2" />
                Your offered tokens will be locked in a secure vault on-chain until the
                offer is accepted or cancelled.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !isConnected}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!isConnected
                ? "Connect Wallet"
                : isLoading
                ? "Creating..."
                : "Create Offer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

