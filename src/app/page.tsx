import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import LightPillar from "@/components/LightPillar";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 z-0 w-full h-full pointer-events-none opacity-40">
        <LightPillar
          topColor="#9945FF"
          bottomColor="#14F195"
          intensity={1.0}
          rotationSpeed={0.3}
          glowAmount={0.005}
          pillarWidth={3.0}
          pillarHeight={0.4}
          noiseIntensity={0.5}
          pillarRotation={0}
          interactive={false}
          mixBlendMode="screen"
        />
      </div>

      <div className="relative z-10 space-y-24 py-12">
        {/* Hero Section */}
        <section className="text-center space-y-8 py-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Fair Swap Protocol
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              A trustless, decentralized swap protocol on Solana. Trade NFTs and tokens with confidence.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/dashboard">Launch App</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href="#how-it-works">Learn More</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Why Fair Swap?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built on Solana for speed, security, and low transaction costs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 space-y-4 text-center border-2 hover:border-primary/50 transition-colors backdrop-blur-sm bg-background/50">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Secure</h3>
              <p className="text-muted-foreground">
                Smart contract-based escrow ensures safe trades without intermediaries
              </p>
            </Card>

            <Card className="p-8 space-y-4 text-center border-2 hover:border-primary/50 transition-colors backdrop-blur-sm bg-background/50">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Fast</h3>
              <p className="text-muted-foreground">
                Lightning-fast transactions powered by Solana blockchain
              </p>
            </Card>

            <Card className="p-8 space-y-4 text-center border-2 hover:border-primary/50 transition-colors backdrop-blur-sm bg-background/50">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Low Fees</h3>
              <p className="text-muted-foreground">
                Minimal transaction costs make swapping affordable for everyone
              </p>
            </Card>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, transparent, and secure trading in three steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Create an Offer</h3>
              <p className="text-muted-foreground">
                List your NFT or tokens for swap. Specify what you're looking for in return.
              </p>
            </div>
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Review Proposals</h3>
              <p className="text-muted-foreground">
                Receive proposals from interested traders. Review and choose the best offer.
              </p>
            </div>
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Complete Swap</h3>
              <p className="text-muted-foreground">
                Accept a proposal and the smart contract handles the rest securely.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-12 md:p-16 text-center space-y-8 backdrop-blur-sm border border-primary/10">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to Start Trading?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect your wallet and join the Fair Swap community today
            </p>
          </div>
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/dashboard">Get Started Now</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
