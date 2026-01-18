import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FairSwap - Decentralized P2P Exchange",
  description: "Secure, trustless peer-to-peer asset exchange on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary`}
      >
        <Providers>
          {/* Subtle background gradient, barely visible for depth */}
          <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8 md:py-12 animate-in fade-in duration-500">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
