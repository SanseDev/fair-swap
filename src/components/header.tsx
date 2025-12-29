"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Loader2, AlertCircle, LayoutDashboard, ShoppingBag, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function Header() {
  const pathname = usePathname();
  const {
    isConnected,
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

  const navLinks = [
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/create-offer", label: "Create Offer", icon: PlusCircle },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 transition-transform group-hover:scale-105">
              <Image 
                src="/fairswap.png" 
                alt="FairSwap Logo" 
                fill 
                className="object-contain rounded-full"
                priority
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground/90">
              FairSwap
            </h1>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                    isActive
                      ? "text-foreground bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 rounded-lg bg-primary/5 -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {error && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium animate-in fade-in slide-in-from-right-4">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}

          {!isConnected ? (
            <Button
              onClick={openWalletModal}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow transition-all rounded-full px-6"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          ) : isAuthenticating ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm">
                <Loader2 className="w-3.5 h-3.5 text-yellow-500 animate-spin" />
                <span className="text-sm font-medium text-yellow-500">
                  Verifying...
                </span>
              </div>
              <Button
                onClick={logout}
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-muted"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 backdrop-blur-sm group hover:border-primary/30 transition-colors">
                <div className="w-2 h-2 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
                <span className="text-sm font-medium text-foreground/90 font-mono">
                  {walletAddress && formatAddress(walletAddress)}
                </span>
              </div>
              <Button
                onClick={logout}
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border-border/50 bg-background/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                title="Disconnect"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
