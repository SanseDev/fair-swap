import { BaseRepository } from './base.repository.js';
import { Offer } from '../types/index.js';

export class OfferRepository extends BaseRepository<Offer> {
  constructor() {
    super('offers');
  }

  async findBySeller(seller: string, limit = 100): Promise<Offer[]> {
    return this.query().where({ seller }).limit(limit).orderBy('created_at', 'desc');
  }

  async findByStatus(status: Offer['status'], limit = 100): Promise<Offer[]> {
    return this.query().where({ status }).limit(limit).orderBy('created_at', 'desc');
  }

  async findByTokenMints(tokenMintA?: string, tokenMintB?: string, limit = 100): Promise<Offer[]> {
    const query = this.query();
    
    if (tokenMintA) {
      query.where({ token_mint_a: tokenMintA });
    }
    
    if (tokenMintB) {
      query.where({ token_mint_b: tokenMintB });
    }
    
    return query.limit(limit).orderBy('created_at', 'desc');
  }

  async findBySellerAndOfferId(seller: string, offerId: string): Promise<Offer | null> {
    return this.query().where({ seller, offer_id: offerId }).first();
  }

  async updateStatus(id: string, status: Offer['status']): Promise<Offer | null> {
    return this.update(id, { status } as Partial<Offer>);
  }

  async findActiveOffers(limit = 100): Promise<Offer[]> {
    return this.findByStatus('active', limit);
  }
}




