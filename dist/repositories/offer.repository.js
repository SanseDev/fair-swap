import { BaseRepository } from './base.repository.js';
const NATIVE_SOL_MINT = 'So11111111111111111111111111111111111111112';
export class OfferRepository extends BaseRepository {
    constructor() {
        super('offers');
    }
    async findWithFilters(filters) {
        const { limit = 100, offset = 0, status, seller, token_mint_a, token_mint_b, asset_type } = filters;
        const query = this.query();
        if (status) {
            query.where({ status });
        }
        if (seller) {
            query.where('seller', 'ilike', `%${seller}%`);
        }
        if (token_mint_a) {
            query.where('token_mint_a', 'ilike', `%${token_mint_a}%`);
        }
        if (token_mint_b) {
            query.where('token_mint_b', 'ilike', `%${token_mint_b}%`);
        }
        if (asset_type && asset_type !== 'all') {
            this.applyAssetTypeFilter(query, asset_type);
        }
        return query.limit(limit).offset(offset).orderBy('created_at', 'desc');
    }
    applyAssetTypeFilter(query, assetType) {
        switch (assetType) {
            case 'sol':
                query.where((builder) => {
                    builder.where('token_mint_a', NATIVE_SOL_MINT)
                        .orWhere('token_mint_b', NATIVE_SOL_MINT);
                });
                break;
            case 'nft':
                query.where((builder) => {
                    builder.where('token_amount_a', '1')
                        .orWhere('token_amount_b', '1');
                });
                break;
            case 'spl':
                query.where((builder) => {
                    builder.where('token_mint_a', '!=', NATIVE_SOL_MINT)
                        .where('token_mint_b', '!=', NATIVE_SOL_MINT)
                        .where('token_amount_a', '!=', '1')
                        .where('token_amount_b', '!=', '1');
                });
                break;
        }
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