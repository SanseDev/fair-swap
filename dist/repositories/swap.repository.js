import { BaseRepository } from './base.repository.js';
export class SwapRepository extends BaseRepository {
    constructor() {
        super('swaps');
    }
    async findByBuyer(buyer, limit = 100) {
        return this.query().where({ buyer }).limit(limit).orderBy('executed_at', 'desc');
    }
    async findBySeller(seller, limit = 100) {
        return this.query().where({ seller }).limit(limit).orderBy('executed_at', 'desc');
    }
    async findByOfferId(offerId) {
        return this.query().where({ offer_id: offerId }).orderBy('executed_at', 'desc');
    }
    async findRecentSwaps(limit = 100) {
        return this.query().limit(limit).orderBy('executed_at', 'desc');
    }
    async getSwapStats() {
        const totalSwaps = await this.query().count('* as count').first();
        const activeOffers = await this.db('offers')
            .where({ status: 'active' })
            .count('* as count')
            .first();
        return {
            total_swaps: parseInt(totalSwaps?.count || '0'),
            total_volume: parseInt(totalSwaps?.count || '0'), // Using swap count as volume for now
            active_offers: parseInt(activeOffers?.count || '0'),
        };
    }
}
//# sourceMappingURL=swap.repository.js.map