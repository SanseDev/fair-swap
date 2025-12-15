"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { useCreateProposal } from "@/hooks/use-create-proposal";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { AssetSelector, SelectedAsset } from "@/components/asset-selector";
import { toast } from "sonner";
import { toTokenAmount } from "@/lib/token-utils";
import { Offer } from "@/lib/types";

interface ProposalFormProps {
  offer: Offer;
  onSuccess?: () => void;
}

export function ProposalForm({ offer, onSuccess }: ProposalFormProps) {
  const { isConnected, isAuthenticated, openWalletModal } = useWalletAuth();
  const { createProposal, isLoading } = useCreateProposal();

  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset | null>(null);
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedAsset) {
      newErrors.asset = "Please select an asset to propose";
    }

    if (selectedAsset?.mint === offer.token_mint_b) {
      newErrors.asset = "You must propose a different asset than requested";
    }

    if (selectedAsset?.type === "token") {
      const parsedAmount = parseFloat(amount);
      if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
        newErrors.amount = "Amount must be greater than 0";
      }

      // Check balance
      if (selectedAsset.data && "uiAmount" in selectedAsset.data) {
        const availableBalance = parseFloat(selectedAsset.data.uiAmount);
        if (parsedAmount > availableBalance) {
          newErrors.amount = `Insufficient balance (available: ${selectedAsset.data.uiAmount})`;
        }
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
      const finalAmount = selectedAsset!.type === "nft" ? "1" : amount;
      const decimals = selectedAsset!.decimals || 0;
      const tokenAmount = toTokenAmount(finalAmount, decimals);

      const result = await createProposal({
        offer,
        proposedMint: selectedAsset!.mint,
        proposedAmount: tokenAmount,
      });

      toast.success("Proposal submitted successfully!", {
        description: `Transaction: ${result.signature.slice(0, 8)}...`,
      });

      // Reset form
      setSelectedAsset(null);
      setAmount("");
      
      onSuccess?.();
    } catch (err: any) {
      console.error("Failed to create proposal:", err);
      toast.error("Failed to submit proposal", {
        description: err.message || "Please try again",
      });
    }
  };

  if (!offer.allow_alternatives) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Make Alternative Proposal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Propose Different Asset
            </label>
            <AssetSelector
              value={selectedAsset || undefined}
              onChange={(asset) => {
                setSelectedAsset(asset);
                if (asset.type === "nft") {
                  setAmount("1");
                }
                setErrors({ ...errors, asset: "" });
              }}
              label="Select Asset to Propose"
              excludeMint={offer.token_mint_a}
            />
            {errors.asset && (
              <p className="text-xs text-red-500">{errors.asset}</p>
            )}
          </div>

          {selectedAsset?.type === "token" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                step="any"
                placeholder="Amount to propose"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrors({ ...errors, amount: "" });
                }}
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && (
                <p className="text-xs text-red-500">{errors.amount}</p>
              )}
              {selectedAsset.data && "uiAmount" in selectedAsset.data && (
                <p className="text-xs text-muted-foreground">
                  Available: {selectedAsset.data.uiAmount} {selectedAsset.data.symbol}
                </p>
              )}
            </div>
          )}

          {selectedAsset?.type === "nft" && (
            <p className="text-xs text-muted-foreground">
              NFT proposals are always 1:1
            </p>
          )}

          <Button 
            type="submit" 
            disabled={isLoading || !isConnected}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isConnected
              ? "Connect Wallet"
              : isLoading
              ? "Submitting..."
              : "Submit Proposal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

