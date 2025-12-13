import { BaseRepository } from './base.repository.js';
interface IndexerState {
    key: string;
    last_processed_slot: number;
    updated_at: Date;
}
export declare class IndexerStateRepository extends BaseRepository<IndexerState> {
    constructor();
    getLastProcessedSlot(): Promise<number>;
    updateLastProcessedSlot(slot: number): Promise<void>;
}
export {};
//# sourceMappingURL=indexer-state.repository.d.ts.map