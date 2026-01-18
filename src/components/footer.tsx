import Link from "next/link";
import Image from "next/image";
import { Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/60 backdrop-blur-xl mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100">
               <Image 
                src="/fairswap.png" 
                alt="FairSwap Logo" 
                fill 
                className="object-contain rounded-full"
              />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-none text-foreground/80">FairSwap</h3>
              <p className="text-xs text-muted-foreground mt-1">Trustless P2P Asset Exchange</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Documentation</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="https://github.com/SanseDev/fair-swap" target="_blank" className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Github className="w-5 h-5" />
            </Link>
            <Link href="#" className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Twitter className="w-5 h-5" />
            </Link>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border/40 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FairSwap. Built on Solana.</p>
        </div>
      </div>
    </footer>
  );
}
