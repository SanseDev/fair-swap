import { BaseRepository } from './base.repository.js';
import { Offer } from '../types/index.js';
export interface OfferFilters {
    status?: Offer['status'];
    seller?: string;
    token_mint_a?: string;
    token_mint_b?: string;
    asset_type?: 'sol' | 'spl' | 'nft' | 'all';
    limit?: number;
    offset?: number;
}
export declare class OfferRepository extends BaseRepository<Offer> {
    constructor();
    findWithFilters(filters: OfferFilters): Promise<Offer[]>;
    private applyAssetTypeFilter;
    findBySeller(seller: string, limit?: number): Promise<Offer[]>;
    findByStatus(status: Offer['status'], limit?: number): Promise<Offer[]>;
    findByTokenMints(tokenMintA?: string, tokenMintB?: string, limit?: number): Promise<Offer[]>;
    findBySellerAndOfferId(seller: string, offerId: string): Promise<Offer | null>;
    updateStatus(id: string, status: Offer['status']): Promise<Offer | null>;
    findActiveOffers(limit?: number): Promise<Offer[]>;
}
//# sourceMappingURL=offer.repository.d.ts.map