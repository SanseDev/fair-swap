import { BaseRepository } from './base.repository';
import { Swap } from '../types';

export class SwapRepository extends BaseRepository<Swap> {
  constructor() {
    super('swaps');
  }

  async findByBuyer(buyer: string, limit = 100): Promise<Swap[]> {
    const { data, error } = await this.query
      .select('*')
      .eq('buyer', buyer)
      .order('executed_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data || []) as Swap[];
  }

  async findBySeller(seller: string, limit = 100): Promise<Swap[]> {
    const { data, error } = await this.query
      .select('*')
      .eq('seller', seller)
      .order('executed_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data || []) as Swap[];
  }

  async findByOfferId(offerId: string): Promise<Swap[]> {
    const { data, error } = await this.query
      .select('*')
      .eq('offer_id', offerId)
      .order('executed_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as Swap[];
  }

  async findRecentSwaps(limit = 100): Promise<Swap[]> {
    const { data, error } = await this.query
      .select('*')
      .order('executed_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data || []) as Swap[];
  }

  async getSwapStats() {
    const { count: totalSwaps, error: swapsError } = await this.query
      .select('*', { count: 'exact', head: true });
    
    if (swapsError) throw swapsError;

    const { count: activeOffers, error: offersError } = await this.supabase
      .from('offers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    if (offersError) throw offersError;

    return {
      total_swaps: totalSwaps || 0,
      total_volume: totalSwaps || 0,
      active_offers: activeOffers || 0,
    };
  }
}




