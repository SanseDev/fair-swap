import { BaseRepository } from './base.repository';
import { Proposal } from '../types';

export class ProposalRepository extends BaseRepository<Proposal> {
  constructor() {
    super('proposals');
  }

  async findByBuyer(buyer: string, limit = 100): Promise<Proposal[]> {
    const { data, error } = await this.query
      .select('*')
      .eq('buyer', buyer)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data || []) as Proposal[];
  }

  async findByOfferId(offerId: string, limit = 100): Promise<Proposal[]> {
    const { data, error } = await this.query
      .select('*')
      .eq('offer_id', offerId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data || []) as Proposal[];
  }

  async findByStatus(status: Proposal['status'], limit = 100): Promise<Proposal[]> {
    const { data, error } = await this.query
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data || []) as Proposal[];
  }

  async updateStatus(id: string, status: Proposal['status']): Promise<Proposal | null> {
    return this.update(id, { status } as Partial<Proposal>);
  }

  async findPendingProposals(offerId?: string): Promise<Proposal[]> {
    let query = this.query.select('*').eq('status', 'pending');
    
    if (offerId) {
      query = query.eq('offer_id', offerId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as Proposal[];
  }
}




