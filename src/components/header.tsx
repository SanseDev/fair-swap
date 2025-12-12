"use client";

import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Check, AlertCircle } from "lucide-react";

export function Header() {
  const {
    isConnected,
    isAuthenticated,
    isAuthenticating,
    walletAddress,
    error,
    authenticate,
    logout,
    openWalletModal,
  } = useWalletAuth();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <header className="mb-8 flex items-center justify-between backdrop-blur-sm bg-background/50 p-4 rounded-xl border border-border/50">
      <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
        FairSwap
      </h1>

      <div className="flex items-center gap-3">
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {!isConnected ? (
          <Button
            onClick={openWalletModal}
            variant="default"
            className="flex items-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </Button>
        ) : isAuthenticating ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="w-4 h-4 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
              <span className="text-sm font-medium text-yellow-400">
                Authenticating...
              </span>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-green-400">
                {walletAddress && formatAddress(walletAddress)}
              </span>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

