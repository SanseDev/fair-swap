import { BaseRepository } from './base.repository.js';
import { Proposal } from '../types/index.js';
export declare class ProposalRepository extends BaseRepository<Proposal> {
    constructor();
    findByBuyer(buyer: string, limit?: number): Promise<Proposal[]>;
    findByOfferId(offerId: string, limit?: number): Promise<Proposal[]>;
    findByStatus(status: Proposal['status'], limit?: number): Promise<Proposal[]>;
    updateStatus(id: string, status: Proposal['status']): Promise<Proposal | null>;
    findPendingProposals(offerId?: string): Promise<Proposal[]>;
}
//# sourceMappingURL=proposal.repository.d.ts.map