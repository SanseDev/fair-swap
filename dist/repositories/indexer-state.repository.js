import { BaseRepository } from './base.repository.js';
export class IndexerStateRepository extends BaseRepository {
    constructor() {
        super('indexer_state');
    }
    async getLastProcessedSlot() {
        const state = await this.query().where({ key: 'fair_swap' }).first();
        return state?.last_processed_slot || 0;
    }
    async updateLastProcessedSlot(slot) {
        await this.query()
            .where({ key: 'fair_swap' })
            .update({
            last_processed_slot: slot,
            updated_at: this.db.fn.now(),
        });
    }
}
//# sourceMappingURL=indexer-state.repository.js.map