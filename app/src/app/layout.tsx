import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FairSwap",
  description: "Trustless P2P Asset Exchange on Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground relative overflow-x-hidden`}
      >
        <Providers>
          <div className="container mx-auto py-8 px-4 relative z-10">
             <header className="mb-8 flex items-center justify-between backdrop-blur-sm bg-background/50 p-4 rounded-xl border border-border/50">
                <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">FairSwap</h1>
             </header>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
