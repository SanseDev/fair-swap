"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Proposal } from "@/lib/types";

// Use Next.js API routes (no external API needed)
const API_URL = "";

interface UseProposalsOptions {
  offerId?: string;
  buyer?: string;
  status?: string;
}

export function useProposals(options: UseProposalsOptions = {}) {
  const { offerId, buyer, status } = options;

  return useQuery({
    queryKey: ["proposals", offerId, buyer, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (offerId) params.append("offer_id", offerId);
      if (buyer) params.append("buyer", buyer);
      if (status) params.append("status", status);

      const response = await fetch(`${API_URL}/api/proposals?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch proposals");
      }
      const data = await response.json();
      return data.data as Proposal[];
    },
    enabled: !!(offerId || buyer),
  });
}

export function useProposalsByOffer(offerId: string) {
  return useQuery({
    queryKey: ["proposals", "offer", offerId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/proposals/offer/${offerId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch proposals");
      }
      const data = await response.json();
      return data.data as Proposal[];
    },
    enabled: !!offerId,
  });
}

