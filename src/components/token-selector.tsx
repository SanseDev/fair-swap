"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Search, TrendingUp, Wallet, Plus, CheckCircle } from "lucide-react";
import { useWalletTokens, WalletToken, SUGGESTED_TOKENS } from "@/hooks/use-wallet-tokens";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { isValidPublicKey } from "@/lib/token-utils";
import { cn } from "@/lib/utils";

interface TokenSelectorProps {
  value?: string;
  onChange: (mint: string, token?: WalletToken) => void;
  label?: string;
  excludeMint?: string; // Exclude a specific token (e.g., the other token in a swap)
}

export function TokenSelector({ value, onChange, label = "Select Token", excludeMint }: TokenSelectorProps) {
  const { isConnected } = useWalletAuth();
  const { tokens, isLoading, validateCustomToken } = useWalletTokens();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customMint, setCustomMint] = useState("");
  const [isValidatingCustom, setIsValidatingCustom] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<WalletToken | null>(null);

  // Find selected token info
  useEffect(() => {
    if (value) {
      const token = tokens.find((t) => t.mint === value) || SUGGESTED_TOKENS.find((t) => t.mint === value);
      if (token) {
        setSelectedToken(token as WalletToken);
      }
    }
  }, [value, tokens]);

  // Filter tokens based on search
  const filteredTokens = tokens.filter((token) => {
    if (excludeMint && token.mint === excludeMint) return false;
    if (!searchQuery) return true;
    return (
      token.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.mint.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Suggested tokens that user owns
  const ownedSuggestedTokens = SUGGESTED_TOKENS.filter((suggested) =>
    tokens.some((token) => token.mint === suggested.mint && token.mint !== excludeMint)
  ).map((suggested) => {
    const walletToken = tokens.find((t) => t.mint === suggested.mint);
    return { ...suggested, balance: walletToken?.balance || 0, uiAmount: walletToken?.uiAmount || "0" };
  });

  const handleSelectToken = (token: WalletToken) => {
    onChange(token.mint, token);
    setSelectedToken(token);
    setIsOpen(false);
    setSearchQuery("");
    setCustomMint("");
    setCustomError(null);
  };

  const handleValidateCustomToken = async () => {
    if (!customMint.trim()) {
      setCustomError("Please enter a token mint address");
      return;
    }

    if (!isValidPublicKey(customMint)) {
      setCustomError("Invalid Solana address");
      return;
    }

    if (excludeMint && customMint === excludeMint) {
      setCustomError("Cannot select the same token");
      return;
    }

    setIsValidatingCustom(true);
    setCustomError(null);

    try {
      const validatedToken = await validateCustomToken(customMint);
      if (validatedToken) {
        handleSelectToken(validatedToken);
      } else {
        setCustomError("Invalid token mint address");
      }
    } catch (err: any) {
      setCustomError(err.message || "Failed to validate token");
    } finally {
      setIsValidatingCustom(false);
    }
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
          {selectedToken?.logoURI ? (
            <img src={selectedToken.logoURI} alt={selectedToken.symbol} className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          )}
          <div className="text-left">
            <div className="font-medium">{selectedToken?.symbol || "Select Token"}</div>
            {selectedToken && (
              <div className="text-xs text-muted-foreground">
                {selectedToken.name} • {selectedToken.mint.slice(0, 4)}...{selectedToken.mint.slice(-4)}
              </div>
            )}
          </div>
        </div>
        <Search className="w-4 h-4 text-muted-foreground" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or paste address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Suggested Tokens */}
            {ownedSuggestedTokens.length > 0 && !searchQuery && (
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Suggested Tokens
                </div>
                <div className="space-y-1">
                  {ownedSuggestedTokens.map((token) => (
                    <button
                      key={token.mint}
                      type="button"
                      onClick={() => handleSelectToken(token as WalletToken)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors",
                        value === token.mint && "bg-muted"
                      )}
                    >
                      {token.logoURI ? (
                        <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Wallet className="w-4 h-4" />
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-xs text-muted-foreground">{token.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{token.uiAmount}</div>
                      </div>
                      {value === token.mint && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Your Tokens */}
            {isConnected && (
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Wallet className="w-4 h-4" />
                  Your Tokens
                </div>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredTokens.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    {searchQuery ? "No tokens found" : "No tokens in wallet"}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredTokens.map((token) => (
                      <button
                        key={token.mint}
                        type="button"
                        onClick={() => handleSelectToken(token)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors",
                          value === token.mint && "bg-muted"
                        )}
                      >
                        {token.logoURI ? (
                          <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <Wallet className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex-1 text-left">
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-xs text-muted-foreground">
                            {token.mint.slice(0, 4)}...{token.mint.slice(-4)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{token.uiAmount}</div>
                        </div>
                        {value === token.mint && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Custom Token */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <Plus className="w-4 h-4" />
                Custom Token
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Paste token mint address..."
                  value={customMint}
                  onChange={(e) => {
                    setCustomMint(e.target.value);
                    setCustomError(null);
                  }}
                  className={customError ? "border-red-500" : ""}
                />
                {customError && <p className="text-xs text-red-500">{customError}</p>}
                <Button
                  type="button"
                  onClick={handleValidateCustomToken}
                  disabled={isValidatingCustom || !customMint.trim()}
                  className="w-full"
                  variant="secondary"
                >
                  {isValidatingCustom && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isValidatingCustom ? "Validating..." : "Add Custom Token"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

