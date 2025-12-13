"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Coins } from "lucide-react";
import { useCreateOffer } from "@/hooks/use-create-offer";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { toast } from "sonner";
import { PublicKey } from "@solana/web3.js";
import { KNOWN_TOKENS, isValidPublicKey, toTokenAmount } from "@/lib/token-utils";

export function CreateOfferForm() {
  const router = useRouter();
  const { isConnected, isAuthenticated, openWalletModal } = useWalletAuth();
  const { createOffer, isLoading } = useCreateOffer();

  const [formData, setFormData] = useState({
    tokenMintA: "",
    tokenAmountA: "",
    tokenMintB: "",
    tokenAmountB: "",
    allowAlternatives: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate token mint addresses
    if (!formData.tokenMintA || !isValidPublicKey(formData.tokenMintA)) {
      newErrors.tokenMintA = "Invalid token mint address";
    }

    if (!formData.tokenMintB || !isValidPublicKey(formData.tokenMintB)) {
      newErrors.tokenMintB = "Invalid token mint address";
    }

    // Validate amounts
    const amountA = parseFloat(formData.tokenAmountA);
    if (!formData.tokenAmountA || isNaN(amountA) || amountA <= 0) {
      newErrors.tokenAmountA = "Amount must be greater than 0";
    }

    const amountB = parseFloat(formData.tokenAmountB);
    if (!formData.tokenAmountB || isNaN(amountB) || amountB <= 0) {
      newErrors.tokenAmountB = "Amount must be greater than 0";
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
      // Convert amounts to smallest unit (assuming 9 decimals for most tokens)
      const tokenAmountA = toTokenAmount(formData.tokenAmountA, 9);
      const tokenAmountB = toTokenAmount(formData.tokenAmountB, 9);

      const result = await createOffer({
        tokenMintA: formData.tokenMintA,
        tokenAmountA,
        tokenMintB: formData.tokenMintB,
        tokenAmountB,
        allowAlternatives: formData.allowAlternatives,
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
              {/* Token A (Offering) */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  You Offer (Token A)
                </label>
                <div className="space-y-2">
                  <div>
                    <Input
                      placeholder="Token Mint Address (e.g., So11111...)"
                      value={formData.tokenMintA}
                      onChange={(e) =>
                        setFormData({ ...formData, tokenMintA: e.target.value })
                      }
                      className={errors.tokenMintA ? "border-red-500" : ""}
                    />
                    {errors.tokenMintA && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {errors.tokenMintA}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tokenMintA: KNOWN_TOKENS.TOKEN_A })}
                        className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded"
                      >
                        Token A
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tokenMintA: KNOWN_TOKENS.TOKEN_B })}
                        className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded"
                      >
                        Token B
                      </button>
                    </div>
                  </div>
                  <div>
                    <Input
                      type="number"
                      step="any"
                      placeholder="Amount (e.g., 10.5)"
                      value={formData.tokenAmountA}
                      onChange={(e) =>
                        setFormData({ ...formData, tokenAmountA: e.target.value })
                      }
                      className={errors.tokenAmountA ? "border-red-500" : ""}
                    />
                    {errors.tokenAmountA && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {errors.tokenAmountA}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Token B (Requesting) */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  You Request (Token B)
                </label>
                <div className="space-y-2">
                  <div>
                    <Input
                      placeholder="Token Mint Address (e.g., EPjFWdd...)"
                      value={formData.tokenMintB}
                      onChange={(e) =>
                        setFormData({ ...formData, tokenMintB: e.target.value })
                      }
                      className={errors.tokenMintB ? "border-red-500" : ""}
                    />
                    {errors.tokenMintB && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {errors.tokenMintB}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tokenMintB: KNOWN_TOKENS.TOKEN_A })}
                        className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded"
                      >
                        Token A
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tokenMintB: KNOWN_TOKENS.TOKEN_B })}
                        className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded"
                      >
                        Token B
                      </button>
                    </div>
                  </div>
                  <div>
                    <Input
                      type="number"
                      step="any"
                      placeholder="Amount (e.g., 100)"
                      value={formData.tokenAmountB}
                      onChange={(e) =>
                        setFormData({ ...formData, tokenAmountB: e.target.value })
                      }
                      className={errors.tokenAmountB ? "border-red-500" : ""}
                    />
                    {errors.tokenAmountB && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {errors.tokenAmountB}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Alternative Proposals Option */}
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
              <input
                type="checkbox"
                id="alternatives"
                checked={formData.allowAlternatives}
                onChange={(e) =>
                  setFormData({ ...formData, allowAlternatives: e.target.checked })
                }
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

