import { BaseRepository } from './base.repository.js';
export class ProposalRepository extends BaseRepository {
    constructor() {
        super('proposals');
    }
    async findByBuyer(buyer, limit = 100) {
        return this.query().where({ buyer }).limit(limit).orderBy('created_at', 'desc');
    }
    async findByOfferId(offerId, limit = 100) {
        return this.query().where({ offer_id: offerId }).limit(limit).orderBy('created_at', 'desc');
    }
    async findByStatus(status, limit = 100) {
        return this.query().where({ status }).limit(limit).orderBy('created_at', 'desc');
    }
    async updateStatus(id, status) {
        return this.update(id, { status });
    }
    async findPendingProposals(offerId) {
        const query = this.query().where({ status: 'pending' });
        if (offerId) {
            query.where({ offer_id: offerId });
        }
        return query.orderBy('created_at', 'desc');
    }
}
//# sourceMappingURL=proposal.repository.js.map