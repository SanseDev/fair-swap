import { ParsedInstruction } from './parser.js';
export declare class TransactionProcessor {
    private offerRepo;
    private proposalRepo;
    private swapRepo;
    constructor();
    processInstruction(instruction: ParsedInstruction, signature: string, slot: number): Promise<void>;
    private handleInitializeOffer;
    private handleCancelOffer;
    private handleExecuteSwap;
    private handleSubmitProposal;
    private handleAcceptProposal;
    private handleWithdrawProposal;
}
//# sourceMappingURL=processor.d.ts.map