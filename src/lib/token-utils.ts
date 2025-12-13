import { PublicKey } from "@solana/web3.js";

// Test tokens on devnet
export const KNOWN_TOKENS = {
  TOKEN_A: "C4G1qgNVUJanw8T3VTeJKPtXai3p3k44A7KoiW5LgqZ4",
  TOKEN_B: "6Hy5jN5gtA5fkhcYXw6ReNYd88oj3LW9i7hSsxDJTVo8",
  // Mainnet tokens (for reference)
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
} as const;

export const TOKEN_LABELS: Record<string, string> = {
  [KNOWN_TOKENS.TOKEN_A]: "Test Token A (1000)",
  [KNOWN_TOKENS.TOKEN_B]: "Test Token B (500)",
  [KNOWN_TOKENS.SOL]: "SOL",
  [KNOWN_TOKENS.USDC]: "USDC",
};

// Convert human-readable amount to lamports/smallest unit
export function toTokenAmount(amount: number | string, decimals: number = 9): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return Math.floor(num * Math.pow(10, decimals)).toString();
}

// Convert lamports/smallest unit to human-readable amount
export function fromTokenAmount(amount: string | number, decimals: number = 9): number {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return num / Math.pow(10, decimals);
}

// Validate Solana public key
export function isValidPublicKey(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

// Format token amount for display
export function formatTokenAmount(amount: string | number, decimals: number = 9): string {
  const readable = fromTokenAmount(amount, decimals);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 9,
  }).format(readable);
}

// Shorten address for display
export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Get token label or shortened address
export function getTokenLabel(mint: string): string {
  return TOKEN_LABELS[mint] || shortenAddress(mint);
}


