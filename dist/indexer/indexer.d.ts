export declare class FairSwapIndexer {
    private connection;
    private parser;
    private processor;
    private stateRepo;
    private programId;
    private isRunning;
    private pollInterval;
    constructor();
    start(): Promise<void>;
    stop(): Promise<void>;
    private poll;
    private processNewTransactions;
    private processTransaction;
}
//# sourceMappingURL=indexer.d.ts.map