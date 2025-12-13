import { BaseRepository } from './base.repository.js';
import { Swap } from '../types/index.js';
export declare class SwapRepository extends BaseRepository<Swap> {
    constructor();
    findByBuyer(buyer: string, limit?: number): Promise<Swap[]>;
    findBySeller(seller: string, limit?: number): Promise<Swap[]>;
    findByOfferId(offerId: string): Promise<Swap[]>;
    findRecentSwaps(limit?: number): Promise<Swap[]>;
    getSwapStats(): Promise<{
        total: number;
        last24h: number;
    }>;
}
//# sourceMappingURL=swap.repository.d.ts.map