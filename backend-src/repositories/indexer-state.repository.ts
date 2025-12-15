import { BaseRepository } from './base.repository.js';

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
    const { data, error } = await this.query
      .select('*')
      .eq('key', 'fair_swap')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return 0;
      throw error;
    }
    return data?.last_processed_slot || 0;
  }

  async updateLastProcessedSlot(slot: number): Promise<void> {
    const { error } = await this.query
      .update({ 
        last_processed_slot: slot,
        updated_at: new Date().toISOString(),
      })
      .eq('key', 'fair_swap');
    
    if (error) throw error;
  }
}




