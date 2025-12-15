import axios from 'axios';
import { Offer, Proposal, Swap, SwapStats } from './types';

// Use Next.js API routes (no external API needed)
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Send cookies with requests
});

export const getActiveOffers = async (params?: any) => {
  const response = await api.get<{ data: Offer[] }>('/offers', { params: { ...params, status: 'active' } });
  return response.data.data;
};

export const getOffers = async (params?: any) => {
    const response = await api.get<{ data: Offer[] }>('/offers', { params });
    return response.data.data;
}

export const getOffer = async (id: string) => {
  const response = await api.get<{ data: Offer }>(`/offers/${id}`);
  return response.data.data;
};

export const getProposals = async (offerId?: string, params?: any) => {
  const query = { ...params };
  if (offerId) query.offer_id = offerId;
  const response = await api.get<{ data: Proposal[] }>('/proposals', { params: query });
  return response.data.data;
};

export const getSwaps = async (params?: any) => {
  const response = await api.get<{ data: Swap[] }>('/swaps', { params });
  return response.data.data;
};

export const getSwapStats = async () => {
  const response = await api.get<{ data: SwapStats }>('/swaps/stats');
  return response.data.data;
};

export const createOffer = async (offerData: {
  offer_id: string;
  seller: string;
  token_mint_a: string;
  token_amount_a: string;
  token_mint_b: string;
  token_amount_b: string;
  allow_alternatives: boolean;
  signature: string;
  slot?: number;
}) => {
  const response = await api.post<{ data: Offer }>('/offers', offerData);
  return response.data.data;
};

