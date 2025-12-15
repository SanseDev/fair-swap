import { BaseRepository } from './base.repository';
import { Proposal } from '../types';

export class ProposalRepository extends BaseRepository<Proposal> {
  constructor() {
    super('proposals');
  }

  async findByBuyer(buyer: string, limit = 100): Promise<Proposal[]> {
    return this.query().where({ buyer }).limit(limit).orderBy('created_at', 'desc');
  }

  async findByOfferId(offerId: string, limit = 100): Promise<Proposal[]> {
    return this.query().where({ offer_id: offerId }).limit(limit).orderBy('created_at', 'desc');
  }

  async findByStatus(status: Proposal['status'], limit = 100): Promise<Proposal[]> {
    return this.query().where({ status }).limit(limit).orderBy('created_at', 'desc');
  }

  async updateStatus(id: string, status: Proposal['status']): Promise<Proposal | null> {
    return this.update(id, { status } as Partial<Proposal>);
  }

  async findPendingProposals(offerId?: string): Promise<Proposal[]> {
    const query = this.query().where({ status: 'pending' });
    
    if (offerId) {
      query.where({ offer_id: offerId });
    }
    
    return query.orderBy('created_at', 'desc');
  }
}




