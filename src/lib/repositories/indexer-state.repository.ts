import { BaseRepository } from './base.repository';

interface IndexerState {
  key: string;
  last_processed_slot: number;
  updated_at: Date;
}

export class IndexerStateRepository extends BaseRepository<IndexerState> {
  constructor() {
    super('indexer_state');
  }

  async getLastProcessedSlot(): Promise<number> {
    const state = await this.query().where({ key: 'fair_swap' }).first();
    return state?.last_processed_slot || 0;
  }

  async updateLastProcessedSlot(slot: number): Promise<void> {
    await this.query()
      .where({ key: 'fair_swap' })
      .update({
        last_processed_slot: slot,
        updated_at: this.db.fn.now(),
      });
  }
}




