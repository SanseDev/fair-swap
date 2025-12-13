import { BaseRepository } from './base.repository.js';
export class OfferRepository extends BaseRepository {
    constructor() {
        super('offers');
    }
    async findBySeller(seller, limit = 100) {
        return this.query().where({ seller }).limit(limit).orderBy('created_at', 'desc');
    }
    async findByStatus(status, limit = 100) {
        return this.query().where({ status }).limit(limit).orderBy('created_at', 'desc');
    }
    async findByTokenMints(tokenMintA, tokenMintB, limit = 100) {
        const query = this.query();
        if (tokenMintA) {
            query.where({ token_mint_a: tokenMintA });
        }
        if (tokenMintB) {
            query.where({ token_mint_b: tokenMintB });
        }
        return query.limit(limit).orderBy('created_at', 'desc');
    }
    async findBySellerAndOfferId(seller, offerId) {
        return this.query().where({ seller, offer_id: offerId }).first();
    }
    async updateStatus(id, status) {
        return this.update(id, { status });
    }
    async findActiveOffers(limit = 100) {
        return this.findByStatus('active', limit);
    }
}
//# sourceMappingURL=offer.repository.js.map