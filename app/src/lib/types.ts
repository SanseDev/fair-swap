export interface Offer {
  id: string;
  offer_id: string;
  seller: string;
  token_mint_a: string;
  token_amount_a: string;
  token_mint_b: string;
  token_amount_b: string;
  allow_alternatives: boolean;
  status: 'active' | 'cancelled' | 'completed';
  signature: string;
  slot: number;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  proposal_id: string;
  buyer: string;
  offer_id: string;
  proposed_mint: string;
  proposed_amount: string;
  status: 'pending' | 'accepted' | 'withdrawn';
  signature: string;
  slot: number;
  created_at: string;
  updated_at: string;
}

export interface Swap {
  id: string;
  offer_id: string;
  proposal_id: string | null;
  buyer: string;
  seller: string;
  token_a_mint: string;
  token_a_amount: string;
  token_b_mint: string;
  token_b_amount: string;
  signature: string;
  slot: number;
  executed_at: string;
}

export interface SwapStats {
  total_volume: number;
  total_swaps: number;
  active_offers: number;
  // Add other stats as returned by the backend
}

