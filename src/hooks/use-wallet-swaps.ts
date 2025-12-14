import { useQuery } from "@tanstack/react-query";
import { getSwaps } from "@/lib/api";
import { useWalletAuth } from "./use-wallet-auth";

export function useWalletSwaps() {
  const { walletAddress, isConnected } = useWalletAuth();

  const { data: buyerSwaps, isLoading: buyerLoading } = useQuery({
    queryKey: ["swaps", "buyer", walletAddress],
    queryFn: () => walletAddress ? getSwaps({ buyer: walletAddress }) : Promise.resolve([]),
    enabled: isConnected && !!walletAddress,
  });

  const { data: sellerSwaps, isLoading: sellerLoading } = useQuery({
    queryKey: ["swaps", "seller", walletAddress],
    queryFn: () => walletAddress ? getSwaps({ seller: walletAddress }) : Promise.resolve([]),
    enabled: isConnected && !!walletAddress,
  });

  // Combine and deduplicate
  const allSwaps = [
    ...(buyerSwaps || []),
    ...(sellerSwaps || []),
  ].filter((swap, index, self) => 
    index === self.findIndex(s => s.id === swap.id)
  ).sort((a, b) => 
    new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime()
  );

  return {
    swaps: allSwaps,
    buyerSwaps: buyerSwaps || [],
    sellerSwaps: sellerSwaps || [],
    isLoading: buyerLoading || sellerLoading,
  };
}

