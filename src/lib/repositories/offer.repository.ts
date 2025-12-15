import { BaseRepository } from './base.repository';
import { Offer } from '../types';

const NATIVE_SOL_MINT = 'So11111111111111111111111111111111111111112';

export interface OfferFilters {
  status?: Offer['status'];
  seller?: string;
  token_mint_a?: string;
  token_mint_b?: string;
  asset_type?: 'sol' | 'spl' | 'nft' | 'all';
  limit?: number;
  offset?: number;
}

export class OfferRepository extends BaseRepository<Offer> {
  constructor() {
    super('offers');
  }

  async findWithFilters(filters: OfferFilters): Promise<Offer[]> {
    const { limit = 100, offset = 0, status, seller, token_mint_a, token_mint_b, asset_type } = filters;
    
    let query = this.query.select('*');

    if (status) {
      query = query.eq('status', status);
    }

    if (seller) {
      query = query.ilike('seller', `%${seller}%`);
    }

    if (token_mint_a) {
      query = query.ilike('token_mint_a', `%${token_mint_a}%`);
    }

    if (token_mint_b) {
      query = query.ilike('token_mint_b', `%${token_mint_b}%`);
    }

    if (asset_type && asset_type !== 'all') {
      query = this.applyAssetTypeFilter(query, asset_type);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return (data || []) as Offer[];
  }

  private applyAssetTypeFilter(query: any, assetType: 'sol' | 'spl' | 'nft') {
    switch (assetType) {
      case 'sol':
        return query.or(`token_mint_a.eq.${NATIVE_SOL_MINT},token_mint_b.eq.${NATIVE_SOL_MINT}`);
      case 'nft':
        return query.or('token_amount_a.eq.1,token_amount_b.eq.1');
      case 'spl':
        return query
          .neq('token_mint_a', NATIVE_SOL_MINT)
          .neq('token_mint_b', NATIVE_SOL_MINT)
          .neq('token_amount_a', '1')
          .neq('token_amount_b', '1');
    }
  }

  async findBySeller(seller: string, limit = 100): Promise<Offer[]> {
    const { data, error } = await this.query
      .select('*')
      .eq('seller', seller)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data || []) as Offer[];
  }

  async findByStatus(status: Offer['status'], limit = 100): Promise<Offer[]> {
    const { data, error } = await this.query
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data || []) as Offer[];
  }

  async findByTokenMints(tokenMintA?: string, tokenMintB?: string, limit = 100): Promise<Offer[]> {
    let query = this.query.select('*');
    
    if (tokenMintA) {
      query = query.eq('token_mint_a', tokenMintA);
    }
    
    if (tokenMintB) {
      query = query.eq('token_mint_b', tokenMintB);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data || []) as Offer[];
  }

  async findBySellerAndOfferId(seller: string, offerId: string): Promise<Offer | null> {
    const { data, error } = await this.query
      .select('*')
      .eq('seller', seller)
      .eq('offer_id', offerId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Offer;
  }

  async updateStatus(id: string, status: Offer['status']): Promise<Offer | null> {
    return this.update(id, { status } as Partial<Offer>);
  }

  async findActiveOffers(limit = 100): Promise<Offer[]> {
    return this.findByStatus('active', limit);
  }
}




