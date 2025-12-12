import { BaseRepository } from './base.repository.js';
import { Swap } from '../types/index.js';

export class SwapRepository extends BaseRepository<Swap> {
  constructor() {
    super('swaps');
  }

  async findByBuyer(buyer: string, limit = 100): Promise<Swap[]> {
    return this.query().where({ buyer }).limit(limit).orderBy('executed_at', 'desc');
  }

  async findBySeller(seller: string, limit = 100): Promise<Swap[]> {
    return this.query().where({ seller }).limit(limit).orderBy('executed_at', 'desc');
  }

  async findByOfferId(offerId: string): Promise<Swap[]> {
    return this.query().where({ offer_id: offerId }).orderBy('executed_at', 'desc');
  }

  async findRecentSwaps(limit = 100): Promise<Swap[]> {
    return this.query().limit(limit).orderBy('executed_at', 'desc');
  }

  async getSwapStats() {
    const totalSwaps = await this.query().count('* as count').first();
    const last24h = await this.query()
      .where('executed_at', '>=', this.db.raw("NOW() - INTERVAL '24 hours'"))
      .count('* as count')
      .first();

    return {
      total: parseInt(totalSwaps?.count as string || '0'),
      last24h: parseInt(last24h?.count as string || '0'),
    };
  }
}




