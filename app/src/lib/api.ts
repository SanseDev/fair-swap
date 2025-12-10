import axios from 'axios';
import { Offer, Proposal, Swap, SwapStats } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
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

