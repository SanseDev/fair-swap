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
        const last24h = await this.query()
            .where('executed_at', '>=', this.db.raw("NOW() - INTERVAL '24 hours'"))
            .count('* as count')
            .first();
        return {
            total: parseInt(totalSwaps?.count || '0'),
            last24h: parseInt(last24h?.count || '0'),
        };
    }
}
//# sourceMappingURL=swap.repository.js.map